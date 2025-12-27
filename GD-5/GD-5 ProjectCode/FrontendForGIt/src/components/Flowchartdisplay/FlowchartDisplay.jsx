import React, { useState, useCallback, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  FaSearch,
  FaBars,
  FaTimes,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";
import { motion } from "framer-motion"; // Import framer-motion
import Navbar from "../navbar/Navbar";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import "./FlowchartDisplay.css";
import { useLocation } from "react-router-dom";
import Aivoicerobot from "../../assets/Aivoice.gif";

const API_KEY = import.meta.env.VITE_GENERATIVE_AI_API_KEY;
const MODEL = import.meta.env.VITE_GENERATEIVE_AI_MODEL;

// Add these layout constants so the gap is configurable in one place
const VIDEO_WIDTH = 360;
const VIDEO_HEIGHT = 260;
const VIDEO_HORIZONTAL_GAP = 40;
const VIDEO_VERTICAL_GAP = 140; // <-- adjust this value to increase/decrease gap between videos

// Add ErrorBoundary class to catch render errors and report them using onError prop
class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null };
	}
	static getDerivedStateFromError(error) {
		return { hasError: true, error };
	}
	componentDidCatch(error, info) {
		if (typeof this.props.onError === "function") {
			try { this.props.onError(error); } catch (e) { /* ignore */ }
		}
	}
	render() {
		if (this.state.hasError) {
			// Minimal fallback UI (we still call onError)
			return (
				<div style={{ padding: 20 }}>
					<h3 className="text-white font-bold">Something went wrong.</h3>
					<p>{String(this.state.error)}</p>
					<button onClick={() => { this.setState({ hasError: false, error: null }); if (this.props.onReset) this.props.onReset(); }} className="btn btn-sm btn-danger">
						Reset
					</button>
				</div>
			);
		}
		return this.props.children;
	}
}

const FlowchartDisplay = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [summary, setSummary] = useState("");
  const [cleanDetails, setCleanDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [importExportVisible, setImportExportVisible] = useState(false); // State to toggle sidebar visibility
  const [isReading, setIsReading] = useState(false);
  const [readingNodeId, setReadingNodeId] = useState(null);
  // track selected (highlighted) node
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const utteranceRef = useRef(null);
  // React Flow instance ref for programmatic viewport control
  const reactFlowInstanceRef = useRef(null);
  
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search");
    if (search) {
      setSearchTerm(search);
      handleSearch(search);
    }
  }, [location]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const toggleImportExportVisibility = () => {
    setImportExportVisible(!importExportVisible);
  };

  const handleSearch = async (term) => {
    if (!term) return;

    setLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL });

      const roadmapPrompt = `Generate a structured roadmap for ${term}, listing key technologies or steps in sequential order. Including definition, importance, use cases.`;
      const summaryPrompt = `Generate a summary of ${roadmapPrompt}.`;

      const roadmapResult = await model.generateContent(roadmapPrompt);
      const roadmapText = await roadmapResult.response.text();
      const processedData = processFlowData(roadmapText);

      // generate nodes, set state and center on the first (starting) node
      const generated = generateNodes(processedData);
      setNodes(generated);
      setEdges(generateEdges(processedData));
      if (generated && generated.length > 0) {
        const first = generated[0];
        // short delay to ensure ReactFlow rendered the new nodes
        setTimeout(() => {
          try {
            if (reactFlowInstanceRef.current && first.position) {
              if (typeof reactFlowInstanceRef.current.setCenter === "function") {
                reactFlowInstanceRef.current.setCenter(
                  first.position.x,
                  first.position.y,
                  { duration: 400 }
                );
              } else if (typeof reactFlowInstanceRef.current.setViewport === "function") {
                reactFlowInstanceRef.current.setViewport({
                  x: -first.position.x + window.innerWidth / 2,
                  y: -first.position.y + window.innerHeight / 2,
                  zoom: 1,
                });
              } else {
                // fallback: attempt fitView focusing the node id (if available)
                try { reactFlowInstanceRef.current.fitView?.({ padding: 0.2 }); } catch(e) {}
              }
            }
          } catch (e) {
            // ignore centering failures
          }
        }, 100);
      }

      const summaryResult = await model.generateContent(summaryPrompt);
      const summaryResponse = await summaryResult.response.text();
      const cleanedSummary = cleanGeneratedText(summaryResponse);
      setSummary(cleanedSummary);

      // Record to CSV: topic, nodes, summary, model, timestamp
      try {
        appendCsvRecord(term, processedData, cleanedSummary, MODEL);
      } catch (e) {
        console.warn("Failed to record roadmap data to CSV:", e);
      }
    } catch (err) {
      const errorMessage =
        err?.message || "Something went wrong while fetching data.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cleanGeneratedText = (text) =>
    text.replace(/[*\-]/g, "").replace(/\s+/g, " ").trim();

  // Replace processFlowData with cleaned/filtered output and simpler id labels
  const processFlowData = (text) => {
    // Split by lines, remove empty lines and common list markup, trim
    return text
      .split(/\r?\n/)
      .map((line) => line.replace(/^[\d\)\.\-\s]+/, "").trim()) // remove leading numbers/bullets
      .filter((line) => line.length > 0)
      .map((line, index) => ({ id: `n${index}`, label: line }));
  };

  const generateNodes = (data) => {
    const colors = [
      "#ffadad",
      "#ffd6a5",
      "#fdffb6",
      "#caffbf",
      "#9bf6ff",
      "#a0c4ff",
      "#bdb2ff",
      "#ffc6ff",
    ];
    const baseX = 600; // center column for vertical flow
    const startY = 100;
    const rowGap = 240; // increased gap between nodes

    return data.map((item, index) => {
      const y = startY + index * rowGap;
      return {
        id: item.id,
        data: { label: item.label },
        position: { x: baseX, y },
        style: {
          backgroundColor: colors[index % colors.length],
          color: "#111",
          borderRadius: "12px",
          padding: "12px",
          fontSize: "14px",
          fontWeight: "600",
          textAlign: "left",
          boxShadow: "2px 4px 12px rgba(0,0,0,0.15)",
          width: "260px",
          whiteSpace: "pre-wrap",
        },
        draggable: true,
        className: `node-${item.id}`,
      };
    });
  };

  const generateEdges = (data) => {
    return data.slice(1).map((item, index) => ({
      id: `e-${data[index].id}-${item.id}`,
      source: data[index].id,
      target: item.id,
      animated: false,
      type: "smoothstep",
      style: { stroke: "#3b82f6", strokeWidth: 2 },
    }));
  };

  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => {
      let updatedNodes = applyNodeChanges(changes, nds);

      // Handle explicit removals: if a roadmap node is removed, also remove its details & video children
      const removedIds = changes
        .filter((c) => c.type === "remove")
        .map((c) => c.id)
        .filter(Boolean);

      if (removedIds.length > 0) {
        // remove details and video nodes associated with each removed id
        const removedIdSet = new Set(removedIds);
        updatedNodes = updatedNodes.filter((n) => {
          // keep node if it's not a details or video child of a removed roadmap node
          // details nodes are "details-<roadmapId>"
          // video nodes are "video-<roadmapId>-<idx>"
          for (const rid of removedIdSet) {
            if (n.id === `details-${rid}`) return false;
            if (n.id.startsWith(`video-${rid}-`)) return false;
          }
          return true;
        });

        // also clean edges state
        setEdges((eds) =>
          eds.filter((e) => {
            // drop edges that reference removed nodes or their generated children
            for (const rid of removedIdSet) {
              if (
                e.source === rid ||
                e.target === rid ||
                e.source === `details-${rid}` ||
                e.target === `details-${rid}` ||
                e.source.startsWith(`video-${rid}-`) ||
                e.target.startsWith(`video-${rid}-`)
              ) {
                return false;
              }
            }
            return true;
          })
        );
      }

      // Reposition related video nodes when a details node moves using radial layout
      changes.forEach((change) => {
        if (change.type === "position" && change.id.startsWith("details-")) {
          const detailsNode = updatedNodes.find((n) => n.id === change.id);
          if (!detailsNode) return;

          // source roadmap id was used when creating videos: details-<sourceId> -> video-<sourceId>-<idx>
          const sourceId = change.id.replace(/^details-/, "");
          const relatedVideoNodes = updatedNodes
            .filter((n) => n.id.startsWith(`video-${sourceId}-`))
            .sort((a, b) => {
              const ai = Number(a.id.split("-").pop() || 0);
              const bi = Number(b.id.split("-").pop() || 0);
              return ai - bi;
            });

          const count = relatedVideoNodes.length;
          if (count === 0) return;

          const detailsWidthLocal = 400; // unchanged
          // use the shared constants for gaps/heights
          const videoHeightLocal = VIDEO_HEIGHT;
          const horizontalGapLocal = VIDEO_HORIZONTAL_GAP;
          const verticalGapLocal = VIDEO_VERTICAL_GAP;
          const baseX = detailsNode.position.x + detailsWidthLocal + horizontalGapLocal;
          const totalH = count * videoHeightLocal + (count - 1) * verticalGapLocal;
          const baseStartY = detailsNode.position.y - totalH / 2 + videoHeightLocal / 2;

          relatedVideoNodes.forEach((videoNode, idx) => {
            videoNode.position = {
              x: baseX,
              y: baseStartY + idx * (videoHeightLocal + verticalGapLocal),
            };
          });
        }
      });

      return [...updatedNodes];
    });
  }, []);

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection) =>
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    []
  );

  // Improved voice helpers and robust read/stop/toggle logic

// wait for available voices (resolves immediately when voices present)
const waitForVoices = () =>
  new Promise((resolve) => {
    const resolveVoices = () => {
      const v = window.speechSynthesis.getVoices() || [];
      if (v && v.length) return resolve(v);
      return null;
    };
    if (resolveVoices()) return;
    const handler = () => {
      const v = window.speechSynthesis.getVoices() || [];
      if (v && v.length) {
        window.speechSynthesis.removeEventListener("voiceschanged", handler);
        resolve(v);
      }
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    // fallback: resolve after short timeout with whatever is available
    setTimeout(() => resolve(window.speechSynthesis.getVoices() || []), 1500);
  });

// pick preferred male English voice, fallback to any English, then first available
const pickPreferredVoice = (voices) => {
  if (!voices || voices.length === 0) return null;
  // Prefer explicit male voices (name/voiceURI frequently contains "Male" or known vendor markers)
  const male = voices.find((v) => /male/i.test(v.name) || /male/i.test(v.voiceURI));
  if (male) return male;
  // Next prefer any English voice
  const english = voices.find((v) => /^en\b/.test((v.lang || "").toLowerCase()));
  if (english) return english;
  // Fallback to the first available voice
  return voices[0];
};

const readText = async (nodeId, text) => {
  if (!text) return;
  // stop any existing speech and clear previous handlers
  stopReading();

  try {
    const voicesList = await waitForVoices();
    const voiceObj = pickPreferredVoice(voicesList);

    const utterance = new window.SpeechSynthesisUtterance(String(text));
    utterance.lang = "en-US";
    utterance.rate = 0.95; // slightly slower but natural
    utterance.pitch = 1;
    utterance.volume = 1;
    if (voiceObj) utterance.voice = voiceObj;

    // attach handlers that cleanly remove references
    utterance.onend = () => {
      // ensure we only clear if this utterance is still current
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        setIsReading(false);
        setReadingNodeId(null);
      }
    };
    utterance.onerror = (ev) => {
      console.error("TTS error", ev);
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        setIsReading(false);
        setReadingNodeId(null);
      }
    };

    // keep reference then speak
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsReading(true);
    setReadingNodeId(nodeId);
  } catch (e) {
    console.error("readText failed", e);
    setIsReading(false);
    setReadingNodeId(null);
  }
};

  // helper: stop any reading
  const stopReading = () => {
    try {
      const current = utteranceRef.current;
      // remove handlers from current utterance to avoid later callbacks
      if (current) {
        try {
          current.onend = null;
          current.onerror = null;
        } catch (e) {}
      }
      // cancel any speech in flight
      if (window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      console.error("stopReading failed", e);
    } finally {
      utteranceRef.current = null;
      setIsReading(false);
      setReadingNodeId(null);
    }
  };

  // toggle for node
  const toggleRead = (nodeId, text) => {
    if (!text) return;
    // if same node is playing -> stop, otherwise start new read
    if (readingNodeId === nodeId && isReading) {
      stopReading();
      return;
    }
    readText(nodeId, text);
  };

  // helper to create details node label (used during node creation and when updating icons)
  const createDetailsLabel = (nodeId, ttsText) => (
    <div style={{ position: "relative" }}>
      <p style={{ marginBottom: "10px" }}>{ttsText}</p>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleRead(nodeId, ttsText);
          }}
          style={{
            backgroundColor: readingNodeId === nodeId ? "#f44336" : "#4CAF50",
            color: "white",
            padding: "5px 10px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
          title={readingNodeId === nodeId ? "Stop Reading" : "Read Aloud"}
        >
          {readingNodeId === nodeId ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
      </div>
    </div>
  );

  // Helper to apply/remove highlight on nodes by id
const applyNodeHighlight = (id) => {
	setNodes((nds) =>
		nds.map((n) => {
			// keep original style object reference safe
			const baseStyle = n.style || {};
			if (!id) {
				// remove highlight from all nodes
				const { __highlightBorder, __highlightShadow, ...rest } = baseStyle;
				// create cleaned style (preserve other style keys)
				return { ...n, style: { ...rest } };
			}
			if (n.id === id) {
				// apply visible highlight - merge with existing styles
				return {
					...n,
					style: {
						...baseStyle,
						border: "3px solid #F59E0B", // amber border
						boxShadow: "0 8px 20px rgba(245,158,11,0.18)",
					},
				};
			}
			// remove highlight on other nodes
			const { border, boxShadow, ...restStyle } = baseStyle;
			return { ...n, style: { ...restStyle } };
		})
	);
};

  const handleNodeClick = async (event, node) => {
    // If clicking details or video nodes -> existing delete logic should still work,
    // but also clear selection if it relates to deleted nodes.
    if (node.id.startsWith("details-") || node.id.startsWith("video-")) {
      // if the deleted node (or its parent) was selected, clear selection
      if (selectedNodeId && (selectedNodeId === node.id || selectedNodeId.startsWith(`video-${node.id}`) || selectedNodeId === node.id.replace(/^details-/, ""))) {
        setSelectedNodeId(null);
        applyNodeHighlight(null);
      }
      setNodes((nds) => {
        if (node.id.startsWith("details-")) {
          // Remove the details node and all its video nodes
          return nds.filter(
            (n) => n.id !== node.id && !n.id.startsWith(`video-${node.id}-`)
          );
        }
        // If deleting a video node, just remove that node
        return nds.filter((n) => n.id !== node.id);
      });
      setEdges((eds) => {
        if (node.id.startsWith("details-")) {
          // Remove all edges connected to the details node and its video nodes
          return eds.filter(
            (e) =>
              e.source !== node.id &&
              e.target !== node.id &&
              !e.id.startsWith(`e${node.id}-video-`) &&
              !e.source.startsWith(`video-${node.id}-`) &&
              !e.target.startsWith(`video-${node.id}-`)
          );
        }
        // If deleting a video node, just remove edges connected to that node
        return eds.filter((e) => e.source !== node.id && e.target !== node.id);
      });
      return;
    }

    // Toggle selection/highlight for roadmap nodes (non-details/video)
    if (selectedNodeId === node.id) {
      // deselect
      setSelectedNodeId(null);
      applyNodeHighlight(null);
    } else {
      setSelectedNodeId(node.id);
      applyNodeHighlight(node.id);
    }

    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL });

      const detailsPrompt = `Provide a concise, clear explanation of "${node.data.label}" in 2–3 short sentences (max 50 words). Start with a one-line definition, then one sentence on why it matters or when it's used, and finish with a single practical example or next step. Use plain language and do not invent facts.`;
      
      const detailsResult = await model.generateContent(detailsPrompt);
      const detailsText = await detailsResult.response.text();
      const cleanedDetails = cleanGeneratedText(detailsText);

      const colors = [
        "#ffadad",
        "#ffd6a5",
        "#fdffb6",
        "#caffbf",
        "#9bf6ff",
        "#a0c4ff",
        "#bdb2ff",
        "#ffc6ff",
      ];
      const randomColorDetails =
        colors[Math.floor(Math.random() * colors.length)];
      setCleanDetails(cleanedDetails);

      const newNodeId = `details-${node.id}`;
      const detailsOffsetX = 520; // larger horizontal gap to the right
      const detailsYOffset = -10; // small vertical offset to avoid overlap
      const newNode = {
        id: newNodeId,
        data: {
          _tts: cleanedDetails,
          label: createDetailsLabel(newNodeId, cleanedDetails),
        },
        // place details node to the right with a bit of vertical offset
        position: {
          x: node.position.x + detailsOffsetX,
          y: node.position.y + detailsYOffset,
        },
        style: {
          backgroundColor: randomColorDetails,
          color: "#333",
          borderRadius: "12px",
          padding: "12px",
          fontSize: "14px",
          fontWeight: "bold",
          textAlign: "left",
          boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
          width: "400px",
          whiteSpace: "pre-wrap",
        },
        draggable: true,
      };

      setNodes((nds) => [...nds, newNode]);
      setEdges((eds) => [
        ...eds,
        {
          id: `e${node.id}-details`,
          source: node.id,
          target: newNode.id,
          animated: true,
          type: "smoothstep",
          style: { stroke: "green", strokeWidth: 3 },
        },
      ]);

      // Fetch YouTube video
      let topic = `${node.data.label}, explained tutorial, full course`;


      topic = topic.replace(/[^a-zA-Z0-9\s]/g, "").trim(); // Remove special characters and trim spaces
      topic = topic.replace(/^\d+\s*/, ""); // Remove leading numbers
      topic = topic.split(" ").slice(0, 6).join(" "); // Take the first 6 words for relevance
      const apiKey = API_KEY; // Replace with your YouTube API key
      const maxResults = 3;

      let apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        topic
      )}&type=video&maxResults=${maxResults}&key=${apiKey}`;

      let videoResponse = await fetch(apiUrl);
      let videoData = await videoResponse.json();

      // Fallback mechanism if no videos are found
      if (!videoData.items || videoData.items.length === 0) {
        setError(
          `No videos found for the topic: ${topic}. Retrying with fallback query.`
        );
        topic = `${topic} full course`; // Append "full course" to broaden the search
        apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          topic
        )}&type=video&maxResults=${maxResults}&key=${apiKey}`;
        videoResponse = await fetch(apiUrl);
        videoData = await videoResponse.json();

        if (!videoData.items || videoData.items.length === 0) {
          setError("No videos found even with fallback query:", topic);
          return;
        }
      }

      // Create up to 8 video nodes and edges
      const videoNodes = [];
      const videoEdges = [];
      const maxResultsUsed = Math.min(videoData.items.length, maxResults);

      // layout params (keep in sync with details node width)
      const detailsWidth = 400;
      const videoWidth = VIDEO_WIDTH;
      const videoHeight = VIDEO_HEIGHT; // use shared constant
      const horizontalGap = VIDEO_HORIZONTAL_GAP; // use shared constant
      const verticalGap = VIDEO_VERTICAL_GAP; // use shared constant

      const startX = newNode.position.x + detailsWidth + horizontalGap;
      // center videos vertically around the details node
      const totalHeight = maxResultsUsed * videoHeight + (maxResultsUsed - 1) * verticalGap;
      const startY = newNode.position.y - totalHeight / 2 + videoHeight / 2;

      videoData.items.slice(0, maxResultsUsed).forEach((video, idx) => {
        const videoId = video.id.videoId;
        const title = video.snippet.title;
        const description = video.snippet.description;
        const randomColorVideo = colors[Math.floor(Math.random() * colors.length)];
        const videoNodeId = `video-${node.id}-${idx}`;

        const vx = startX;
        const vy = startY + idx * (videoHeight + verticalGap);

        // include plain metadata under data._video so exports/imports can restore the iframe
        videoNodes.push({
          id: videoNodeId,
          data: {
            _video: {
              src: `https://www.youtube.com/embed/${videoId}`,
              title,
              description,
              videoId,
              width: videoWidth,
              height: videoHeight,
            },
            // UI label remains React element for runtime; import/export will use _video
            label: (
              <div style={{ maxWidth: `${videoWidth}px`, borderRadius: "12px", overflow: "hidden", boxShadow: "0 6px 18px rgba(0,0,0,0.12)", margin: "8px" }}>
                <div style={{ background: "#000", height: 200 }}>
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    frameBorder="0"
                    allowFullScreen
                    title={title}
                  ></iframe>
                </div>
                <div style={{ padding: "10px", backgroundColor: "#fff" }}>
                  <h4 style={{ margin: "0 0 6px 0", fontSize: "14px" }}>{title}</h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "#555" }}>{description}</p>
                </div>
              </div>
            ),
          },
           position: { x: vx, y: vy },
           style: {
             backgroundColor: randomColorVideo,
             color: "#333",
             borderRadius: "12px",
             padding: "8px",
             fontSize: "13px",
             fontWeight: "600",
             textAlign: "left",
             boxShadow: "2px 6px 18px rgba(0,0,0,0.12)",
             width: `${videoWidth}px`,
             whiteSpace: "pre-wrap",
           },
           draggable: true,
           className: `node-video-${videoNodeId}`,
         });

        videoEdges.push({
          id: `e-${newNode.id}-${videoNodeId}`,
          source: newNode.id,
          target: videoNodeId,
          animated: true,
          type: "smoothstep",
          style: { stroke: "#7c3aed", strokeWidth: 2 },
        });
      });

      setNodes((nds) => [...nds, ...videoNodes]);
      setEdges((eds) => [...eds, ...videoEdges]);
    } catch (err) {
      setError("Error fetching details or video:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaneClick = (event) => {
    // remove selection highlight when clicking empty area
    if (selectedNodeId) {
      setSelectedNodeId(null);
      applyNodeHighlight(null);
    }
    event.stopPropagation();
    // Do nothing on pane click
  };

  const importFlowchart = (event) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // Validate nodes
        const validNodes = (data.nodes || [])
          .map((node) => {
            if (!node.id || !node.data || !node.position) {
              console.warn(`Invalid node detected and skipped:`, node);
              return null;
            }

            // Check if the node contains video-related data
            if (
              node.id.startsWith("video-") &&
              node.data.label?.props?.children
            ) {
              const iframeProps = node.data.label.props.children.find(
                (child) => child.type === "iframe"
              )?.props;

              if (iframeProps?.src) {
                return {
                  id: node.id,
                  data: {
                    label: (
                      <div
                        style={{
                          maxWidth: "400px",
                          borderRadius: "15px",
                          overflow: "hidden",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                          margin: "10px",
                        }}
                      >
                        <iframe
                          width="100%"
                          height="215"
                          src={iframeProps.src}
                          frameBorder="0"
                          
                          allowFullScreen
                        ></iframe>
                        <div
                          style={{ padding: "10px", backgroundColor: "white" }}
                        >
                          <h4 style={{ margin: "0 0 5px 0" }}>
                            {node.data.label.props.children[1]?.props
                              ?.children[0]?.props?.children || "YouTube Video"}
                          </h4>
                          <p style={{ margin: "0" }}>
                            {node.data.label.props.children[1]?.props
                              ?.children[1]?.props?.children ||
                              "Imported from JSON"}
                          </p>
                        </div>
                      </div>
                    ),
                  },
                  position: node.position,
                  style: {
                    backgroundColor: "#bdb2ff",
                    color: "#333",
                    borderRadius: "12px",
                    padding: "12px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    textAlign: "left",
                    boxShadow: "2px 2px 10px rgba(0,0,0,0.2)",
                    width: "400px",
                    whiteSpace: "pre-wrap",
                  },
                  draggable: true,
                };
              }
            }

            // Prefer serialized video metadata (export includes data._video) to reconstruct iframe UI
            if (node.id.startsWith("video-") && node.data && node.data._video) {
              const v = node.data._video;
              return {
                id: node.id,
                data: {
                  _video: { ...v }, // keep metadata for future exports
                  label: (
                    <div
                      style={{
                        maxWidth: `${v.width || 400}px`,
                        borderRadius: "15px",
                        overflow: "hidden",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                        margin: "10px",
                      }}
                    >
                      <iframe
                        width="100%"
                        height={v.height || 215}
                        src={v.src}
                        frameBorder="0"
                        allowFullScreen
                        title={v.title || "YouTube Video"}
                      ></iframe>
                      <div style={{ padding: "10px", backgroundColor: "white" }}>
                        <h4 style={{ margin: "0 0 5px 0" }}>
                          {v.title || "YouTube Video"}
                        </h4>
                        <p style={{ margin: 0 }}>{v.description || "Imported from JSON"}</p>
                      </div>
                    </div>
                  ),
                },
                position: node.position,
                style: node.style || {
                  backgroundColor: "#bdb2ff",
                  color: "#333",
                  borderRadius: "12px",
                  padding: "12px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  textAlign: "left",
                  boxShadow: "2px 2px 10px rgba(0,0,0,0.2)",
                  width: `${v.width || 400}px`,
                  whiteSpace: "pre-wrap",
                },
                draggable: node.draggable !== undefined ? node.draggable : true,
              };
            }
            // fallback: older exports where label contains nested React elements with an iframe
            if (
              node.id.startsWith("video-") &&
              node.data.label?.props?.children
            ) {
              const iframeProps = node.data.label.props.children.find(
                (child) => child.type === "iframe"
              )?.props;

              if (iframeProps?.src) {
                return {
                  id: node.id,
                  data: {
                    // preserve any available metadata and create a runtime label
                    _video: { src: iframeProps.src, title: node.data.label.props.children[1]?.props?.children[0]?.props?.children || "YouTube Video", description: node.data.label.props.children[1]?.props?.children[1]?.props?.children || "" },
                    label: (
                      <div
                        style={{
                          maxWidth: "400px",
                          borderRadius: "15px",
                          overflow: "hidden",
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                          margin: "10px",
                        }}
                      >
                        <iframe
                          width="100%"
                          height="215"
                          src={iframeProps.src}
                          frameBorder="0"
                          allowFullScreen
                        ></iframe>
                        <div style={{ padding: "10px", backgroundColor: "white" }}>
                          <h4 style={{ margin: "0 0 5px 0" }}>
                            {node.data.label.props.children[1]?.props?.children[0]?.props?.children || "YouTube Video"}
                          </h4>
                          <p style={{ margin: "0" }}>
                            {node.data.label.props.children[1]?.props?.children[1]?.props?.children || "Imported from JSON"}
                          </p>
                        </div>
                      </div>
                    ),
                  },
                  position: node.position,
                  style: node.style || {
                    backgroundColor: "#bdb2ff",
                    color: "#333",
                    borderRadius: "12px",
                    padding: "12px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    textAlign: "left",
                    boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
                    width: "400px",
                    whiteSpace: "pre-wrap",
                  },
                  draggable: true,
                };
              }
            }

            // Extract plain text content from the label
            const label = node.data.label;
            const validLabel = (() => {
              if (typeof label === "string" || typeof label === "number") {
                return label; // Valid React child
              } else if (React.isValidElement(label)) {
                return ""; // Ignore React elements
              } else if (typeof label === "object" && label.props?.children) {
                // Extract text content from children
                const extractText = (children) => {
                  if (typeof children === "string") return children;
                  if (Array.isArray(children)) {
                    return children.map(extractText).join(" ");
                  }
                  if (
                    typeof children === "object" &&
                    children.props?.children
                  ) {
                    return extractText(children.props.children);
                  }
                  return "";
                };
                return extractText(label.props.children);
              } else if (typeof label === "object") {
                // Handle objects by converting to a string
                return JSON.stringify(label);
              } else {
                return ""; // Fallback for invalid labels
              }
            })();

            return {
              id: node.id,
              data: { ...node.data, label: validLabel },
              position: node.position,
              style: node.style || {}, // Ensure style exists
              draggable: node.draggable !== undefined ? node.draggable : true, // Default to true
            };
          })
          .filter(Boolean); // Remove invalid nodes

        // Validate edges from import (keep them if they reference valid nodes)
        const importedEdges = (data.edges || [])
          .map((edge) => {
            if (!edge || !edge.id || !edge.source || !edge.target) {
              console.warn("Invalid imported edge skipped:", edge);
              return null;
            }
            return {
              id: edge.id,
              source: edge.source,
              target: edge.target,
              animated: edge.animated !== undefined ? edge.animated : true,
              style: edge.style || { stroke: "blue", strokeWidth: 2 },
            };
          })
          .filter(Boolean);

        // Build a lookup of node ids present after validation
        const nodeIdSet = new Set(validNodes.map((n) => n.id));

        // 1) Roadmap (sequential) nodes: select nodes that are not details/video
        const roadmapNodes = validNodes.filter((n) => {
          return typeof n.id === "string" && !n.id.startsWith("details-") && !n.id.startsWith("video-");
        });

        // rank roadmap nodes by numeric suffix (n0,n1...) if present else by y-position
        const rankNode = (n) => {
          const m = String(n.id).match(/^n(\d+)$/);
          if (m) return Number(m[1]);
          if (n.position && typeof n.position.y === "number") return n.position.y;
          return 0;
        };
        roadmapNodes.sort((a, b) => rankNode(a) - rankNode(b));

        const generatedEdges = [];
        for (let i = 1; i < roadmapNodes.length; i++) {
          const src = roadmapNodes[i - 1].id;
          const tgt = roadmapNodes[i].id;
          generatedEdges.push({
            id: `e-${src}-${tgt}`,
            source: src,
            target: tgt,
            animated: false,
            type: "smoothstep",
            style: { stroke: "#3b82f6", strokeWidth: 2 },
          });
        }

        // 2) Details edges: parent roadmap -> details-<parent>
        validNodes.forEach((n) => {
          if (typeof n.id === "string" && n.id.startsWith("details-")) {
            const parentId = n.id.replace(/^details-/, "");
            if (nodeIdSet.has(parentId)) {
              generatedEdges.push({
                id: `e-${parentId}-${n.id}`,
                source: parentId,
                target: n.id,
                animated: true,
                type: "smoothstep",
                style: { stroke: "green", strokeWidth: 3 },
              });
            }
          }
        });

        // 3) Video edges: details-<source> -> video-<source>-<idx>
        validNodes.forEach((n) => {
          if (typeof n.id === "string" && n.id.startsWith("video-")) {
            const parts = n.id.split("-");
            if (parts.length >= 3) {
              const sourceRoadmapId = parts[1];
              const detailsId = `details-${sourceRoadmapId}`;
              if (nodeIdSet.has(detailsId)) {
                generatedEdges.push({
                  id: `e-${detailsId}-${n.id}`,
                  source: detailsId,
                  target: n.id,
                  animated: true,
                  type: "smoothstep",
                  style: { stroke: "#7c3aed", strokeWidth: 2 },
                });
              }
            }
          }
        });

        // Remove duplicates by id and ensure endpoints exist
        const edgeById = new Map();
        generatedEdges.forEach((e) => {
          if (e && e.id && nodeIdSet.has(e.source) && nodeIdSet.has(e.target)) {
            edgeById.set(e.id, e);
          }
        });
        const finalEdges = Array.from(edgeById.values());

        setNodes(validNodes);
        setEdges(finalEdges);
       } catch (error) {
         console.error("Error importing flowchart:", error);
         alert("Invalid JSON file. Please check the file and try again.");
       }
     };
     fileReader.readAsText(event.target.files[0]);
   };

  const exportFlowchart = () => {
    try {
      // Build serializable nodes: convert any runtime JSX labels into plain data for round-trip import/export
      const exportNodes = (nodes || []).map((n) => {
        const data = {};
        // Preserve explicit video metadata if present
        if (n.data && n.data._video) {
          data._video = { ...n.data._video };
          // include a simple label string for readability in JSON
          data.label = n.data._video.title || `YouTube Video ${n.id}`;
        } else if (n.data && n.data._tts) {
          // details nodes: preserve textual tts content
          data._tts = n.data._tts;
          data.label = n.data._tts;
        } else {
          // normal nodes: try to export the label as string (assume it's already string)
          data.label = typeof n.data?.label === "string" || typeof n.data?.label === "number"
            ? n.data.label
            : String(n.data?.label || "");
        }

        return {
          id: n.id,
          position: n.position,
          style: n.style,
          draggable: n.draggable,
          className: n.className,
          data,
        };
      });
      
      const flowchartData = JSON.stringify({ nodes: exportNodes, edges }, null, 2);
      const blob = new Blob([flowchartData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const fileNameInput = prompt("Enter a name for the exported file (without extension):");
      const safeFileName = fileNameInput && fileNameInput.trim() ? `${fileNameInput.trim()}.json` : "flowchart.json";

      const a = document.createElement("a");
      a.href = url;
      a.download = safeFileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting flowchart:", error);
      alert("An error occurred while exporting the flowchart. Please try again and check the console for details.");
    }
  };

  // CSV store + aggregation (replace earlier roadmapCsv/escapeCsv/appendCsvRecord/downloadRoadmapCsv block)

  const header =
    "topic,nodes_count,summary,model,timestamp,year,month,week,month_count,week_count,total_count\n";

  // aggregation maps (refs to avoid re-renders)
  const topicTotalRef = useRef(new Map());
  const topicWeekRef = useRef(new Map());
  const topicMonthRef = useRef(new Map());

  // initialize CSV content from raw import (if provided) or header
  const [roadmapCsv, setRoadmapCsv] = useState(() => {
    const raw = typeof RoadmapDataRaw === "string" ? RoadmapDataRaw.trim() : "";
    return raw.length > 0 ? (raw.endsWith("\n") ? raw : raw + "\n") : header;
  });

  // small helper to get ISO week number
  const getISOWeek = (date) => {
    const tmp = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const day = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    return Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
  };

  // simple CSV first-field extractor (handles quoted first field)
  const extractFirstField = (line) => {
    if (!line) return "";
    if (line[0] === '"') {
      let i = 1;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          i += 2;
          continue;
        }
        if (line[i] === '"') break;
        i++;
      }
      return line.slice(1, i).replace(/""/g, '"');
    }
    const idx = line.indexOf(",");
    return idx === -1 ? line : line.slice(0, idx);
  };

  // parse existing CSV to populate aggregation maps
  useEffect(() => {
    try {
      const raw =
        typeof RoadmapDataRaw === "string" ? RoadmapDataRaw.trim() : "";
      if (!raw) return;
      const lines = raw.split(/\r?\n/).filter(Boolean);
      // skip header if matches
      const startIdx = lines[0].toLowerCase().startsWith("topic,") ? 1 : 0;
      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i];
        const topic = extractFirstField(line);
        if (!topic) continue;
        const tsMatch = line.match(/,([^,]*)$/); // fallback for timestamp presence
        // increment total
        topicTotalRef.current.set(
          topic,
          (topicTotalRef.current.get(topic) || 0) + 1
        );
        // try to extract timestamp (assume ISO near end)
        const cols = line.split(",").map((c) => c.trim());
        const maybeTs = cols.length >= 5 ? cols[4].replace(/^"|"$/g, "") : null;
        let dt = maybeTs ? new Date(maybeTs) : new Date();
        if (isNaN(dt.getTime())) dt = new Date();
        const weekKey = `${topic}|${dt.getUTCFullYear()}-W${getISOWeek(dt)}`;
        const monthKey = `${topic}|${dt.getUTCFullYear()}-${String(
          dt.getUTCMonth() + 1
        ).padStart(2, "0")}`;
        topicWeekRef.current.set(
          weekKey,
          (topicWeekRef.current.get(weekKey) || 0) + 1
        );
        topicMonthRef.current.set(
          monthKey,
          (topicMonthRef.current.get(monthKey) || 0) + 1
        );
      }
    } catch (e) {
      console.warn("Failed to parse existing RoadmapData CSV:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CSV escaping helper
  const escapeCsv = (value) => {
    if (value === null || value === undefined) return '""';
    const s = typeof value === "string" ? value : JSON.stringify(value);
    return `"${s.replace(/"/g, '""')}"`;
  };

  // append record and update aggregation maps (automatically invoked after search)
  const appendCsvRecord = (topic, nodesArray, summaryText, modelName) => {
    try {
      const ts = new Date().toISOString();
      // update totals
      const total = (topicTotalRef.current.get(topic) || 0) + 1;
      topicTotalRef.current.set(topic, total);
      // week/month keys
      const dt = new Date(ts);
      const week = getISOWeek(dt);
      const weekKey = `${topic}|${dt.getUTCFullYear()}-W${week}`;
      const monthKey = `${topic}|${dt.getUTCFullYear()}-${String(
        dt.getUTCMonth() + 1
      ).padStart(2, "0")}`;
      const weekCount = (topicWeekRef.current.get(weekKey) || 0) + 1;
      const monthCount = (topicMonthRef.current.get(monthKey) || 0) + 1;
      topicWeekRef.current.set(weekKey, weekCount);
      topicMonthRef.current.set(monthKey, monthCount);

      // compact nodes count
      const nodesCount = Array.isArray(nodesArray) ? nodesArray.length : 0;
      const nodesSummary = nodesArray
        .map((n) => ({ id: n.id, label: n.label || n.data?.label || "" }))
        .slice(0, 2500);

      const row =
        [
          escapeCsv(topic),
          escapeCsv(String(nodesCount)),
          escapeCsv(summaryText),
          escapeCsv(modelName),
          escapeCsv(ts),
          escapeCsv(String(dt.getUTCFullYear())),
          escapeCsv(String(dt.getUTCMonth() + 1)),
          escapeCsv(String(week)),
          escapeCsv(String(monthCount)),
          escapeCsv(String(weekCount)),
          escapeCsv(String(total)),
        ].join(",") + "\n";

      setRoadmapCsv((prev) => prev + row);
    } catch (e) {
      console.error("Error appending CSV record:", e);
    }
  };

  const downloadRoadmapCsv = () => {
    try {
      const blob = new Blob([roadmapCsv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "RoadmapData.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV download failed:", err);
      alert("Failed to download roadmap CSV. See console for details.");
    }
  };

  useEffect(() => {
    const handleMouseOver = (event) => {
      const deleteIcon = event.target.querySelector(".delete-icon");
      if (deleteIcon) deleteIcon.style.display = "block";
    };

    const handleMouseOut = (event) => {
      const deleteIcon = event.target.querySelector(".delete-icon");
      if (deleteIcon) deleteIcon.style.display = "none";
    };

    const nodes = document.querySelectorAll(".react-flow__node");
    nodes.forEach((node) => {
      node.addEventListener("mouseover", handleMouseOver);
      node.addEventListener("mouseout", handleMouseOut);
    });

    return () => {
      nodes.forEach((node) => {
        node.removeEventListener("mouseover", handleMouseOver);
        node.removeEventListener("mouseout", handleMouseOut);
      });
    };
  }, [nodes]);

  // update details node labels when readingNodeId changes so icon toggles
  useEffect(() => {
    if (!nodes || nodes.length === 0) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id && n.id.startsWith("details-") && n.data && n.data._tts) {
          return {
            ...n,
            data: {
              ...n.data,
              label: createDetailsLabel(n.id, n.data._tts),
            },
          };
        }
        return n;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readingNodeId]);

  // Reset helper to clear UI state (called from ErrorBoundary or user action)
	const resetApp = () => {
		try {
			setNodes([]);
			setEdges([]);
			setSummary("");
			setCleanDetails("");
			setError(null);
			setSelectedNodeId(null);
			// cancel any speech
			if (utteranceRef.current) { window.speechSynthesis.cancel(); utteranceRef.current = null; }
		} catch (e) {
			console.error("resetApp failed", e);
		}
	};

	// Global error handlers to avoid hard crashes and record via setError
	useEffect(() => {
		const onWindowError = (event) => {
			try {
				// prevent default console noise in some environments
				if (event && typeof event.preventDefault === "function") event.preventDefault();
				const msg = event?.message || (event?.error && event.error.message) || "Unknown window error";
				setError(msg);
				console.error("Window error captured:", event);
			} catch (e) {
				console.error("onWindowError handler failed", e);
			}
		};

		const onUnhandledRejection = (event) => {
			try {
				if (event && typeof event.preventDefault === "function") event.preventDefault();
				const reason = event?.reason || "Unhandled rejection";
				const msg = typeof reason === "string" ? reason : (reason?.message || JSON.stringify(reason));
				setError(msg);
				console.error("Unhandled promise rejection:", reason);
			} catch (e) {
				console.error("onUnhandledRejection handler failed", e);
			}
		};

		window.addEventListener("error", onWindowError);
		window.addEventListener("unhandledrejection", onUnhandledRejection);

		return () => {
			window.removeEventListener("error", onWindowError);
			window.removeEventListener("unhandledrejection", onUnhandledRejection);
		};
	}, [/* no deps */]);

  return (
    <>
		<ErrorBoundary onError={(err) => setError(String(err))} onReset={resetApp}>
		<ReactFlowProvider>
        {/* <Logoarea /> */}
        <Navbar />
        <div className="flex flex-wrap md:flex-nowrap h-screen">
          <motion.div
            className={`flex flex-col justify-between bg-gray-800 p-6 w-full md:w-64 text-white ${
              importExportVisible ? "block" : "hidden"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h4 className="font-bold text-xl text-capitalize">
              Import/Export Flowchart
            </h4>
            <input
              type="file"
              accept="application/json"
              onChange={importFlowchart}
            />
            <div className="d-flex flex-col gap-2 mt-4 mb-4">
              <button
                onClick={exportFlowchart}
                className="btn btn-sm btn-outline-primary"
                style={{ marginBottom: 8 }}
              >
                <i className="bi bi-upload" /> Export Flowchart.json
              </button>
              <button
                onClick={downloadRoadmapCsv}
                className="btn btn-sm btn-primary"
                title="Download recorded roadmap CSV (includes generated data + timestamps)"
              >
                Save User Roadmap Data.csv
              </button>
            </div>
            <footer className="mt-auto text-sm text-center">
              <p>&copy; {new Date().getFullYear()} CodHelp Roadmap Builder</p>
            </footer>
          </motion.div>

          {/* Toggle Button for Import/Export Sidebar */}
          <motion.button
            onClick={toggleImportExportVisibility}
            className=" shadow-lg p-3 text-light bg-dark"
            style={{
              opacity: 1,
            }} // Updated position styles
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {importExportVisible ? <FaTimes size={20} /> : <FaBars size={20} />}
          </motion.button>

          <motion.div
            className="flex-1 bg-gray-100 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex md:flex-row flex-col justify-center gap-2 md:space-x-4 mb-6">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for a roadmap..."
                className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full md:w-1/3"
              />

              <button
                onClick={() => handleSearch(searchTerm)}
                className="d-flex justify-center items-center bg-blue-500 px-4 py-2 rounded-md text-white"
              >
                <FaSearch className="mr-2" /> Search
              </button>
            </div>

            {loading && (
              <div className="flex font-bold justify-center position-relative text-gray-900 text-lg text-center text-pretty items-center">
                <div className="earth flex gap-2 items-center jusstify-center">
                  <div className="earth-loader">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 200 200"
                    >
                      <path
                        transform="translate(100 100)"
                        d="M29.4,-17.4C33.1,1.8,27.6,16.1,11.5,31.6C-4.7,47,-31.5,63.6,-43,56C-54.5,48.4,-50.7,16.6,-41,-10.9C-31.3,-38.4,-15.6,-61.5,-1.4,-61C12.8,-60.5,25.7,-36.5,29.4,-17.4Z"
                        fill="#7CC133"
                      ></path>
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 200 200"
                    >
                      <path
                        transform="translate(100 100)"
                        d="M31.7,-55.8C40.3,-50,45.9,-39.9,49.7,-29.8C53.5,-19.8,55.5,-9.9,53.1,-1.4C50.6,7.1,43.6,14.1,41.8,27.6C40.1,41.1,43.4,61.1,37.3,67C31.2,72.9,15.6,64.8,1.5,62.2C-12.5,59.5,-25,62.3,-31.8,56.7C-38.5,51.1,-39.4,37.2,-49.3,26.3C-59.1,15.5,-78,7.7,-77.6,0.2C-77.2,-7.2,-57.4,-14.5,-49.3,-28.4C-41.2,-42.4,-44.7,-63,-38.5,-70.1C-32.2,-77.2,-16.1,-70.8,-2.3,-66.9C11.6,-63,23.1,-61.5,31.7,-55.8Z"
                        fill="#7CC133"
                      ></path>
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 200 200"
                    >
                      <path
                        transform="translate(100 100)"
                        d="M30.6,-49.2C42.5,-46.1,57.1,-43.7,67.6,-35.7C78.1,-27.6,84.6,-13.8,80.3,-2.4C76.1,8.9,61.2,17.8,52.5,29.1C43.8,40.3,41.4,53.9,33.7,64C26,74.1,13,80.6,2.2,76.9C-8.6,73.1,-17.3,59,-30.6,52.1C-43.9,45.3,-61.9,45.7,-74.1,38.2C-86.4,30.7,-92.9,15.4,-88.6,2.5C-84.4,-10.5,-69.4,-20.9,-60.7,-34.6C-52.1,-48.3,-49.8,-65.3,-40.7,-70C-31.6,-74.8,-15.8,-67.4,-3.2,-61.8C9.3,-56.1,18.6,-52.3,30.6,-49.2Z"
                        fill="#7CC133"
                      ></path>
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 200 200"
                    >
                      <path
                        transform="translate(100 100)"
                        d="M39.4,-66C48.6,-62.9,51.9,-47.4,52.9,-34.3C53.8,-21.3,52.4,-10.6,54.4,1.1C56.3,12.9,61.7,25.8,57.5,33.2C53.2,40.5,39.3,42.3,28.2,46C17,49.6,8.5,55.1,1.3,52.8C-5.9,50.5,-11.7,40.5,-23.6,37.2C-35.4,34,-53.3,37.5,-62,32.4C-70.7,27.4,-70.4,13.7,-72.4,-1.1C-74.3,-15.9,-78.6,-31.9,-73.3,-43C-68.1,-54.2,-53.3,-60.5,-39.5,-60.9C-25.7,-61.4,-12.9,-56,1.1,-58C15.1,-59.9,30.2,-69.2,39.4,-66Z"
                        fill="#7CC133"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-black font-mono text-lg flex flex-col">Loading Roadmap...
                    <span className="text-sm italic font-normal">This may take a while for complex roadmaps</span>
                  </p>
                </div>
              </div>
            )}
            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                <strong>Error!</strong> {error}
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="alert"
                  aria-label="Close"
                ></button>
              </div>
            )}

            <div className="flowchart-container" style={{ height: "100dvh", position: "relative" }}>
              <ReactFlow
                onInit={(instance) => (reactFlowInstanceRef.current = instance)}
                 nodes={nodes}
                 edges={edges}
                 onNodesChange={onNodesChange}
                 onEdgesChange={onEdgesChange}
                 onConnect={onConnect}
                 onNodeClick={handleNodeClick}
                 onPaneClick={handlePaneClick} // Prevent reload on pane click
                 fitView
                 panOnDrag={true} // Enable panning when dragging
                 zoomOnScroll={true} // Enable zooming with scroll
                 zoomOnPinch={true} // Enable zooming with pinch gestures
                 minZoom={0.5} // Set minimum zoom level
                 maxZoom={2} // Set maximum zoom level
                 defaultZoom={1} // Set default zoom level
              >
                <MiniMap
                  nodeStrokeWidth={3}
                  nodeStrokeColor="transparent"
                  nodeColor="#000"
                  nodeBorderRadius={12}
                />
                <Controls />
                <Background variant="lines" />
              </ReactFlow>

              {/*
                AI voice indicator GIF:
                - Shows when `isReading` is true
                - Positioned at the right-bottom corner of the flowpane
                - High z-index so it appears above ReactFlow elements
                - pointerEvents: none keeps it non-interactive
                - Uses framer-motion for a simple appear/disappear animation
                Ensure Aivoice.gif is available in public root ("/Aivoice.gif") or adjust src accordingly.
              */}
              {isReading && (
                <motion.img
                  src={Aivoicerobot}
                  alt="AI speaking"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    position: "absolute",
                    right: 20,
                    bottom:180,
                    width: 120,
                    height: 120,
                    zIndex: 2147483647,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                  aria-hidden="true"
                />
              )}
            </div>
          </motion.div>

          {/* Sidebar Button */}
          <motion.button
            onClick={toggleSidebar}
            className="top-4 right-4 z-50 fixed bg-blue-500 shadow-lg p-3 rounded-full text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </motion.button>

          {/* Right Sidebar */}
          <motion.div
            className={`fixed top-0 right-0 h-full w-full md:w-1/4 bg-white shadow-lg transition-transform transform overflow-scroll ${
              sidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
            initial={{ x: "100%" }}
            animate={{ x: sidebarOpen ? "0%" : "100%" }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-4">
              <motion.section
                style={{
                  backgroundColor: "#caffbf",
                  padding: "1rem",
                  borderRadius: "12px",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="mb-4 font-bold text-2xl">
                  Details about the selected node
                </h2>
                <p className="text-gray-600">
                  {loading && "Loading..."}
                  <br />
                  {cleanDetails || "Click a Node to see details"}
                </p>
              </motion.section>
              <br />
              <motion.section
                style={{
                  backgroundColor: "#9bf6ff",
                  padding: "1rem",
                  borderRadius: "12px",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="mb-4 font-bold text-2xl">
                  {searchTerm || "Summary"}
                </h2>
                <p className="text-gray-600">
                  {loading && "Loading..."}
                  <br />
                  {summary || "No summary available"}
                </p>
              </motion.section>
            </div>
          </motion.div>
        </div>
      </ReactFlowProvider>
		</ErrorBoundary>
    </>
  );
};

export default FlowchartDisplay;