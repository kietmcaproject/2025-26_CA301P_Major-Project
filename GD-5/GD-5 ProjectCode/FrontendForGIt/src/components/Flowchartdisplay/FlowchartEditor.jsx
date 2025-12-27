import React, { useState, useCallback } from "react";
import { motion } from "framer-motion"; // Import framer-motion
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    Handle,
    Position,
    useNodesState,
    useEdgesState,
    ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { Resizable } from "re-resizable"; // Import re-resizable
import { FaSearch, FaBars, FaTimes } from "react-icons/fa";
import Navbar from "../navbar/Navbar";
import Logoarea from "../logoarea/Logoarea";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GENERATIVE_AI_API_KEY;

// Custom Node Component
const CustomNode = ({ id, data }) => {
    const shapeStyles = {
        Circle: { borderRadius: "50%", width: "100px", height: "100px" },
        Square: { borderRadius: "0%", width: "100px", height: "100px" },
        Rectangle: { borderRadius: "0%", width: "150px", height: "100px" },
        Oval: { borderRadius: "50%", width: "150px", height: "100px" },
        Pentagon: {
            clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
            width: "100px",
            height: "100px",
        },
        Hexagon: {
            clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
            width: "100px",
            height: "100px",
        },
        freeShape: { 
            width: data.width || "650px", 
            height: data.height || "auto", 
            padding: "1rem", 
            borderRadius: "12px",
            textAlign: "left" 
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: data.color,
                border: "2px solid black",
                textAlign: "center",
                ...shapeStyles[data.shape],
            }}
        >
            {data.shape === "freeShape" ? (
                <Resizable
                    defaultSize={{
                        width: data.width || 650,
                        height: data.height || "auto",
                    }}
                    onResizeStop={(e, direction, ref, d) => {
                        data.width = ref.style.width;
                        data.height = ref.style.height;
                    }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <div
                        contentEditable
                        suppressContentEditableWarning={true}
                        onBlur={(e) => data.onChange(e.target.innerText)}
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {data.label}
                    </div>
                </Resizable>
            ) : (
                <div
                    contentEditable
                    suppressContentEditableWarning={true}
                    onBlur={(e) => data.onChange(e.target.innerText)}
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {data.label}
                </div>
            )}
            <Handle type="target" position={Position.Top} id="top" />
            <Handle type="target" position={Position.Bottom} id="bottom" />
            <Handle type="target" position={Position.Left} id="left" />
            <Handle type="target" position={Position.Right} id="right" />
            <Handle type="source" position={Position.Top} id="top" />
            <Handle type="source" position={Position.Bottom} id="bottom" />
            <Handle type="source" position={Position.Left} id="left" />
            <Handle type="source" position={Position.Right} id="right" />
        </motion.div>
    );
};

// Define node types
const nodeTypes = {
    custom: CustomNode,
};

const initialNodes = [
    {
        id: "1",
        type: "custom",
        position: { x: 250, y: 5 },
        data: {
            label: "Start",
            color: "lightgreen",
            shape: "Circle",
            onChange: () => {},
        },
    },
    {
        id: "2",
        type: "custom",
        position: { x: 100, y: 100 },
        data: {
            label: "Process",
            color: "lightblue",
            shape: "Square",
            onChange: () => {},
        },
    },
    {
        id: "3",
        type: "custom",
        position: { x: 250, y: 200 },
        data: {
            label: "Decision",
            color: "yellow",
            shape: "Rectangle",
            onChange: () => {},
        },
    },
    {
        id: "4",
        type: "custom",
        position: { x: 400, y: 300 },
        data: { label: "End", color: "red", shape: "Oval", onChange: () => {} },
    },
];

const initialEdges = [{ id: "e1-2", source: "1", target: "2", animated: true }];

// Helper function to generate nodes in the specified style and flow
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

    return data.map((item, index) => ({
        id: item.id,
        data: { label: item.label },
        position: item.position, // Use the position from the data
        style: {
            backgroundColor: colors[index % colors.length],
            color: "#333",
            borderRadius: "12px",
            padding: "12px",
            fontSize: "14px",
            fontWeight: "bold",
            textAlign: "left",
            boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
            width: "200px",
            whiteSpace: "pre-wrap",
        },
        draggable: true,
    }));
};

// Helper function to generate edges connecting nodes
const generateEdges = (data) => {
    return data.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: true,
        style: { stroke: "blue", strokeWidth: 2 },
    }));
};

// Helper function to arrange nodes side by side (left-to-right) with sub-nodes top-to-down
const arrangeNodesSideBySide = (nodes, edges) => {
    const xOffset = 300; // Horizontal spacing between parent nodes
    const yOffset = 150; // Vertical spacing between sub-nodes
    const nodeMap = new Map();

    // Group nodes by their parent based on edges
    edges.forEach((edge) => {
        if (!nodeMap.has(edge.source)) {
            nodeMap.set(edge.source, []);
        }
        nodeMap.get(edge.source).push(edge.target);
    });

    let currentX = 0;

    nodes.forEach((node) => {
        if (!nodeMap.has(node.id)) {
            // Parent node
            node.position = { x: currentX, y: 0 };
            currentX += xOffset;

            // Arrange sub-nodes (children) vertically below the parent
            if (nodeMap.has(node.id)) {
                let currentY = yOffset;
                nodeMap.get(node.id).forEach((childId) => {
                    const childNode = nodes.find((n) => n.id === childId);
                    if (childNode) {
                        childNode.position = { x: node.position.x, y: currentY };
                        currentY += yOffset;
                    }
                });
            }
        }
    });
};

// Helper function to arrange nodes in a snake-running pattern
const arrangeNodesInSnakePattern = (nodes) => {
    const xOffset = 300; // Horizontal spacing
    const yOffset = 150; // Vertical spacing
    let currentX = 0;
    let currentY = 0;
    let direction = 1; // 1 for right, -1 for left

    nodes.forEach((node, index) => {
        node.position = { x: currentX, y: currentY };
        currentX += direction * xOffset;

        // Change direction and move down after every 3 nodes
        if ((index + 1) % 3 === 0) {
            direction *= -1; // Reverse direction
            currentY += yOffset; // Move down
        }
    });
};

// Helper function to arrange nodes in a roadmap pattern
const arrangeNodesInRoadmapPattern = (nodes) => {
    const xOffset = 300; // Horizontal spacing
    const yOffset = 150; // Vertical spacing
    let currentX = 0;
    let currentY = 0;
    let direction = 1; // 1 for right, -1 for left

    nodes.forEach((node, index) => {
        node.position = { x: currentX, y: currentY };
        currentX += direction * xOffset;

        // Change direction and move down after every 3 nodes
        if ((index + 1) % 3 === 0) {
            direction *= -1; // Reverse direction
            currentY += yOffset; // Move down
        }
    });
};

// Helper function to arrange nodes in a horizontal roadmap format
const arrangeNodesInHorizontalRoadmap = (nodes) => {
    const xOffset = 300; // Horizontal spacing
    let currentX = 0;
    const yPosition = 200; // Fixed vertical position for all nodes

    nodes.forEach((node) => {
        node.position = { x: currentX, y: yPosition };
        currentX += xOffset; // Increment horizontal position for the next node
    });
};

// Function to generate a horizontal roadmap
const createHorizontalRoadmap = (data) => {
    const nodes = generateNodes(data.nodes);
    const edges = generateEdges(data.edges);
    arrangeNodesInHorizontalRoadmap(nodes); // Arrange nodes in a horizontal roadmap format
    setNodes(nodes);
    setEdges(edges);
};

// Function to generate a roadmap
const createRoadmap = (data) => {
    const nodes = generateNodes(data.nodes);
    const edges = generateEdges(data.edges);
    arrangeNodesInRoadmapPattern(nodes); // Arrange nodes in a roadmap pattern
    setNodes(nodes);
    setEdges(edges);
};

// Helper function to parse generated roadmap text into nodes and edges
const parseRoadmapText = (text) => {
    try {
        const lines = text.split("\n").filter((line) => line.trim() !== "");
        const nodes = [];
        const edges = [];
        let nodeId = 1;

        lines.forEach((line) => {
            const [source, target] = line.split("->").map((item) => item.trim());
            if (source && !nodes.find((node) => node.data.label === source)) {
                nodes.push({
                    id: `${nodeId++}`,
                    data: { label: source },
                    position: { x: 0, y: 0 }, // Temporary position
                    style: {
                        backgroundColor: "#ffd6a5",
                        color: "#333",
                        borderRadius: "12px",
                        padding: "12px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        textAlign: "left",
                        boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
                        width: "300px",
                        whiteSpace: "pre-wrap",
                    },
                    draggable: true,
                });
            }
            if (target && !nodes.find((node) => node.data.label === target)) {
                nodes.push({
                    id: `${nodeId++}`,
                    data: { label: target },
                    position: { x: 0, y: 0 }, // Temporary position
                    style: {
                        backgroundColor: "#caffbf",
                        color: "#333",
                        borderRadius: "12px",
                        padding: "12px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        textAlign: "left",
                        boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
                        width: "300px",
                        whiteSpace: "pre-wrap",
                    },
                    draggable: true,
                });
            }
            if (source && target) {
                edges.push({
                    id: `e${source}-${target}`,
                    source: nodes.find((node) => node.data.label === source).id,
                    target: nodes.find((node) => node.data.label === target).id,
                    animated: true,
                    style: { stroke: "blue", strokeWidth: 2 },
                });
            }
        });

        return { nodes, edges };
    } catch (err) {
        console.error("Error parsing roadmap text:", err);
        return null;
    }
};

// Example usage of generateNodes and generateEdges
const createRoadmapExample = (data) => {
    const nodes = generateNodes(data.nodes);
    const edges = generateEdges(data.edges);
    arrangeNodesInSnakePattern(nodes); // Arrange nodes in a snake-running pattern
    setNodes(nodes);
    setEdges(edges);
};

function FlowchartEditor() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [nodeId, setNodeId] = useState(5);
    const [selectedNode, setSelectedNode] = useState(null);
    const [newText, setNewText] = useState("");
    const [generatedContent, setGeneratedContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openIcon , setOpenIcon]=useState(false);
    // New state flag to mark an imported flowchart
    const [isImported, setIsImported] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [freeShapeWidth, setFreeShapeWidth] = useState("650px");
    const [freeShapeHeight, setFreeShapeHeight] = useState("auto");
    const [showFreeShapePopup, setShowFreeShapePopup] = useState(false);
    // Handle edge connection
    const onConnect = useCallback((params) => {
        setEdges((eds) =>
            addEdge(
                {
                    ...params,
                    animated: true,
                },
                eds
            )
        );
    }, []);

    const handleOpenIcon = () => {
        setOpenIcon(!openIcon);
    }

    // Function to add a new node
    const addNode = (shape, color, width, height) => {
        const newNode = {
            id: `${nodeId}`,
            position: { x: Math.random() * 500, y: Math.random() * 500 },
            type: "custom",
            data: {
                label: shape,
                color,
                shape,
                width: shape === "freeShape" ? width : undefined,
                height: shape === "freeShape" ? height : undefined,
                onChange: (label) => updateNodeLabel(nodeId, label),
            },
        };
        setNodes((nds) => [...nds, newNode]);
        setNodeId(nodeId + 1);
    };

    const handleFreeShapeAdd = () => {
        setShowFreeShapePopup(true);
    };

    const handleAddFreeShape = () => {
        addNode("freeShape", "#a0c4ff", freeShapeWidth, freeShapeHeight);
        setShowFreeShapePopup(false);
    };

    // Function to update node label
    const updateNodeLabel = (id, label) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, label } } : node
            )
        );
    };

    // Function to delete selected nodes
    const deleteSelectedNodes = () => {
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
    };

    // Function to export the flowchart
    const exportFlowchart = () => {
        try {
            const flowchartData = JSON.stringify({ nodes, edges }, null, 2);
            const blob = new Blob([flowchartData], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const fileName = prompt("Enter the file name:", "flowchart");
            a.download = `${fileName || "flowchart"}.json`;
            a.click();
            URL.revokeObjectURL(url); // Revoke the object URL after download
        } catch (error) {
            console.error("Error exporting flowchart:", error);
            alert("An error occurred while exporting the flowchart. Please try again.");
        }
    };

    // Function to import the flowchart
    const importFlowchart = (event) => {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Validate nodes
                const validNodes = (data.nodes || []).map((node) => {
                    if (!node.id || !node.data || !node.position) {
                        console.warn(`Invalid node detected and skipped:`, node);
                        return null;
                    }

                    // Check if the node contains video-related data
                    if (node.id.startsWith("video-") && node.data.label?.props?.children) {
                        const iframeProps = node.data.label.props.children.find(
                            (child) => child.type === "iframe"
                        )?.props;

                        if (iframeProps?.src) {
                            return {
                                id: node.id,
                                data: {
                                    label: (
                                        <div style={{ maxWidth: "400px", borderRadius: "15px", overflow: "hidden", boxShadow: "0 4px 10px rgba(0,0,0,0.2)", margin: "10px" }}>
                                            <iframe
                                                width="100%"
                                                height="215"
                                                src={iframeProps.src}
                                                frameBorder="0"
                                                allowFullScreen
                                            ></iframe>
                                            <div style={{ padding: "10px", backgroundColor: "white" }}>
                                                <h4 style={{ margin: "0 0 5px 0" }}>{node.data.label.props.children[1]?.props?.children[0]?.props?.children || "YouTube Video"}</h4>
                                                <p style={{ margin: "0" }}>{node.data.label.props.children[1]?.props?.children[1]?.props?.children || "Imported from JSON"}</p>
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
                                    boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
                                    width: "400px",
                                    whiteSpace: "pre-wrap",
                                },
                                draggable: true,
                            };
                        }
                    }

                    // Ensure the label is a valid React child
                    const label = node.data.label;
                    const validLabel = (() => {
                        if (typeof label === "string" || typeof label === "number") {
                            return label; // Valid React child
                        } else if (React.isValidElement(label)) {
                            return label; // Already a valid React element
                        } else if (typeof label === "object" && label.props?.children) {
                            // Extract text content from children
                            const extractText = (children) => {
                                if (typeof children === "string") return children;
                                if (Array.isArray(children)) {
                                    return children.map(extractText).join(" ");
                                }
                                if (typeof children === "object" && children.props?.children) {
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
                        style: node.style || {},
                        draggable: node.draggable !== undefined ? node.draggable : true,
                    };
                }).filter(Boolean);

                // Validate edges
                const validEdges = (data.edges || []).map((edge) => {
                    if (!edge.id || !edge.source || !edge.target) {
                        console.warn(`Invalid edge detected and skipped:`, edge);
                        return null;
                    }
                    return {
                        id: edge.id,
                        source: edge.source,
                        target: edge.target,
                        animated: edge.animated !== undefined ? edge.animated : true,
                        style: edge.style || { stroke: "blue", strokeWidth: 2 },
                    };
                }).filter(Boolean);

                setNodes(validNodes);
                setEdges(validEdges);
                alert("Flowchart imported successfully!");
            } catch (error) {
                console.error("Error importing flowchart:", error);
                alert("Invalid JSON file. Please check the file and try again.");
            }
        };
        if (event.target.files[0]) {
            fileReader.readAsText(event.target.files[0]);
        }
    };

    // Modified handleNodeClick: if imported, auto-generate details node on click
    const handleNodeClick = (event, node) => {
        setSelectedNode(node);
        setGeneratedContent("");
        if (isImported && !node.id.startsWith("details-")) {
            generateContent(node);
        }
    };

    // Function to handle double-click on node
    const handleNodeDoubleClick = async (event, node) => {
        if (!node.id.startsWith("details-") && !node.id.startsWith("video-")) {
            setLoading(true); // Show loading indicator

            try {
                const genAI = new GoogleGenerativeAI(API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                // Generate detailed content for the node
                const detailsPrompt = `Provide a concise explanation of ${node.data.label}, including definition, importance, use cases, and related concepts.`;
                const detailsResult = await model.generateContent(detailsPrompt);
                const detailsText = await detailsResult.response.text();
                const cleanedDetails = detailsText.replace(/[*\-]/g, "").replace(/\s+/g, " ").trim();

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
                const randomColorDetails = colors[Math.floor(Math.random() * colors.length)];

                const detailsNode = {
                    id: `details-${node.id}`,
                    data: {
                        label: (
                            <div style={{ position: "relative" }}>
                                {cleanedDetails}
                                <FaTimes
                                    style={{
                                        position: "absolute",
                                        top: "-10px",
                                        right: "-10px",
                                        cursor: "pointer",
                                        display: "none",
                                    }}
                                    className="delete-icon"
                                    onClick={() => setNodes((nds) => nds.filter((n) => n.id !== `details-${node.id}`))}
                                />
                            </div>
                        ),
                    },
                    position: { x: node.position.x + 200, y: node.position.y },
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

                setNodes((nds) => [...nds, detailsNode]); // Add the new node
                setEdges((eds) => [
                    ...eds,
                    { id: `e${node.id}-details`, source: node.id, target: detailsNode.id, animated: true, style: { stroke: "green", strokeWidth: 2 } },
                ]);

                // Fetch YouTube video
                let topic = node.data.label;
                topic = topic.replace(/[^a-zA-Z0-9\s]/g, "").trim(); // Remove special characters and trim spaces
                topic = topic.replace(/^\d+\s*/, ""); // Remove leading numbers
                topic = topic.split(" ").slice(0, 6).join(" "); // Take the first 6 words for relevance
                const apiKey = API_KEY; // Replace with your YouTube API key
                const maxResults = 1;

                let apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
                    topic
                )}&type=video&maxResults=${maxResults}&key=${apiKey}`;

                let videoResponse = await fetch(apiUrl);
                let videoData = await videoResponse.json();

                // Fallback mechanism if no videos are found
                if (!videoData.items || videoData.items.length === 0) {
                    console.warn(`No videos found for the topic: ${topic}. Retrying with fallback query.`);
                    topic = `${topic} tutorial`; // Append "tutorial" to broaden the search
                    apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
                        topic
                    )}&type=video&maxResults=${maxResults}&key=${apiKey}`;
                    videoResponse = await fetch(apiUrl);
                    videoData = await videoResponse.json();

                    if (!videoData.items || videoData.items.length === 0) {
                        console.error("No videos found even with fallback query:", topic);
                        return;
                    }
                }

                const video = videoData.items[0];
                const videoId = video.id.videoId;
                const title = video.snippet.title;
                const description = video.snippet.description;

                const randomColorVideo = colors[Math.floor(Math.random() * colors.length)];

                const videoNode = {
                    id: `video-${node.id}`,
                    data: {
                        label: (
                            <div style={{ maxWidth: "400px", borderRadius: "15px", overflow: "hidden", boxShadow: "0 4px 10px rgba(0,0,0,0.2)", margin: "10px" }}>
                                <iframe
                                    width="100%"
                                    height="215"
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    frameBorder="0"
                                    allowFullScreen
                                ></iframe>
                                <div style={{ padding: "10px", backgroundColor: "white" }}>
                                    <h4 style={{ margin: "0 0 5px 0" }}>{title}</h4>
                                    <p style={{ margin: "0" }}>{description || "No description available."}</p>
                                </div>
                            </div>
                        ),
                    },
                    position: { x: node.position.x + 400, y: node.position.y + 200 },
                    style: {
                        backgroundColor: randomColorVideo,
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

                setNodes((nds) => [...nds, videoNode]); // Add the video node
                setEdges((eds) => [
                    ...eds,
                    { id: `e${node.id}-video`, source: node.id, target: videoNode.id, animated: true, style: { stroke: "purple", strokeWidth: 2 } },
                ]);
            } catch (err) {
                console.error("Error fetching details or video:", err);
            } finally {
                setLoading(false); // Hide loading indicator
            }
        }
    };

    // New generateContent function for imported flowcharts
    const generateContent = async (node) => {
        if (!node) return;
        setLoading(true);
        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const detailsPrompt = `Provide a concise explanation of ${node.data.label}, including definition, importance, use cases, and related concepts.`;
            const detailsResult = await model.generateContent(detailsPrompt);
            const detailsText = await detailsResult.response.text();
            const cleanedDetails = detailsText.replace(/[*\-]/g, "").replace(/\s+/g, " ").trim();

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
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            setGeneratedContent(cleanedDetails);

            const newNode = {
                id: `details-${node.id}`,
                data: {
                    label: (
                        <div style={{ position: "relative" }}>
                            {cleanedDetails}
                            <FaTimes
                                style={{
                                    position: "absolute",
                                    top: "-10px",
                                    right: "-10px",
                                    cursor: "pointer",
                                    display: "none",
                                }}
                                className="delete-icon"
                            />
                        </div>
                    ),
                },
                position: { x: node.position.x + 200, y: node.position.y },
                style: {
                    backgroundColor: randomColor,
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
                { id: `e${node.id}-details`, source: node.id, target: newNode.id, animated: true },
            ]);
        } catch (err) {
            console.error("Error fetching details:", err);
        } finally {
            setLoading(false);
        }
    };

    // Function to update text in the selected node
    const updateTextInNode = () => {
        if (selectedNode) {
            updateNodeLabel(selectedNode.id, newText);
            setNewText("");
        }
    };

    // Function to generate content for the selected node
    const generateContentForSelectedNode = async () => {
        if (!selectedNode) return;

        setLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const detailsPrompt = `Provide a concise explanation of ${selectedNode.data.label}, including definition, importance, use cases, and related concepts.`;

            const detailsResult = await model.generateContent(detailsPrompt);
            const detailsText = await detailsResult.response.text();
            const cleanedDetails = cleanGeneratedText(detailsText);

            setGeneratedContent(cleanedDetails);
        } catch (err) {
            console.error("Error fetching details:", err);
        } finally {
            setLoading(false);
        }
    };

    const cleanGeneratedText = (text) =>
        text.replace(/[*\-]/g, "").replace(/\s+/g, " ").trim();

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    // Function to handle search
    const handleSearch = async () => {
        if (!searchQuery) return;

        setSearchLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const searchPrompt = `Provide a consise detailed explanation of ${searchQuery}, including definition, importance, use cases, and related concepts.`;

            const searchResult = await model.generateContent(searchPrompt);
            const searchText = await searchResult.response.text();
            const cleanedSearchText = cleanGeneratedText(searchText);

            setSearchResult(cleanedSearchText);
        } catch (err) {
            console.error("Error fetching search result:", err);
        } finally {
            setSearchLoading(false);
        }
    };

    // Function to generate a flowchart by searching for a topic in zigzag waterfall format
    const generateFlowchartInZigzag = async () => {
        if (!searchQuery) {
            alert("Please enter a topic to generate the flowchart.");
            return;
        }

        setLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const flowchartPrompt = `Generate a detailed flowchart for the topic "${searchQuery}". Include key concepts, subtopics, and their relationships.`;
            const flowchartResult = await model.generateContent(flowchartPrompt);
            const flowchartText = await flowchartResult.response.text();

            // Parse the generated content into nodes and edges
            const parsedFlowchart = parseFlowchartText(flowchartText);

            if (parsedFlowchart && parsedFlowchart.nodes.length > 0) {
                arrangeNodesInZigzag(parsedFlowchart.nodes); // Arrange nodes in zigzag waterfall format
                setNodes(parsedFlowchart.nodes);
                setEdges(parsedFlowchart.edges);
                alert("Flowchart generated successfully!");
            } else {
                alert("Failed to generate a flowchart. The response was empty or invalid.");
            }
        } catch (err) {
            console.error("Error generating flowchart:", err);
            alert("An error occurred while generating the flowchart. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Helper function to parse generated flowchart text into nodes and edges
    const parseFlowchartText = (text) => {
        try {
            const lines = text.split("\n").filter((line) => line.trim() !== "");
            const nodes = [];
            const edges = [];
            let nodeId = 1;

            lines.forEach((line) => {
                const [source, target] = line.split("->").map((item) => item.trim());
                if (source && !nodes.find((node) => node.data.label === source)) {
                    nodes.push({
                        id: `${nodeId++}`,
                        data: { label: source },
                        position: { x: 0, y: 0 }, // Temporary position
                        style: {
                            backgroundColor: "#ffd6a5",
                            color: "#333",
                            borderRadius: "12px",
                            padding: "12px",
                            fontSize: "14px",
                            fontWeight: "bold",
                            textAlign: "left",
                            boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
                            width: "200px",
                            whiteSpace: "pre-wrap",
                        },
                        draggable: true,
                    });
                }
                if (target && !nodes.find((node) => node.data.label === target)) {
                    nodes.push({
                        id: `${nodeId++}`,
                        data: { label: target },
                        position: { x: 0, y: 0 }, // Temporary position
                        style: {
                            backgroundColor: "#caffbf",
                            color: "#333",
                            borderRadius: "12px",
                            padding: "12px",
                            fontSize: "14px",
                            fontWeight: "bold",
                            textAlign: "left",
                            boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
                            width: "200px",
                            whiteSpace: "pre-wrap",
                        },
                        draggable: true,
                    });
                }
                if (source && target) {
                    edges.push({
                        id: `e${source}-${target}`,
                        source: nodes.find((node) => node.data.label === source).id,
                        target: nodes.find((node) => node.data.label === target).id,
                        animated: true,
                        style: { stroke: "blue", strokeWidth: 2 },
                    });
                }
            });

            return { nodes, edges };
        } catch (err) {
            console.error("Error parsing flowchart text:", err);
            return null;
        }
    };

    // Helper function to arrange nodes in a zigzag waterfall format
    const arrangeNodesInZigzag = (nodes) => {
        const xOffset = 300; // Horizontal spacing
        const yOffset = 150; // Vertical spacing
        let direction = 1; // 1 for right, -1 for left
        let currentX = 0;
        let currentY = 0;

        nodes.forEach((node, index) => {
            node.position = { x: currentX, y: currentY };
            currentX += direction * xOffset;

            // Change direction and move down after every 3 nodes
            if ((index + 1) % 3 === 0) {
                direction *= -1;
                currentY += yOffset;
            }
        });
    };

    return (
        <ReactFlowProvider >
            {/* <Logoarea /> */}
            <Navbar />
            <div className="flex flex-wrap md:flex-nowrap h-screen">
                {loading && (
                    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                        <div className="bg-white shadow-lg p-4 rounded-lg">
                            <p className="font-bold text-lg">Loading...</p>
                        </div>
                    </div>
                )}
                <motion.div
                    initial={{ x: -200, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col justify-start items-center p-2 continer bg-dark"
                >
                    <h1 className="mb-4 font-bold text-light text-xl">Tools</h1>
                    <button className="rounded-full btn-primary btn btn-sm" onClick={handleOpenIcon}>
                        <i className="bi bi-tools"></i>
                    </button>
                </motion.div>
                {/* leftsidebar */}
                {openIcon&&(
                    <motion.div
                        initial={{ x: -200, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col justify-between bg-gray-800 p-6 w-full md:w-64 text-white"
                    >
                        <h4 className="font-bold text-xl text-capitalize">
                            Shapes
                        </h4>
                        <div className="flex flex-row flex-wrap justify-left gap-2 toolbar">
                            <button
                                onClick={() => addNode("Circle", "lightgreen")}
                                className="flex items-center gap-2 btn-outline-light btn-sm btn"
                            >
                                <i className="bi bi-circle" /> Circle
                            </button>
                            <button
                                onClick={() => addNode("Square", "lightblue")}
                                className="flex items-center gap-2 btn-outline-light btn-sm btn"
                            >
                                <i className="bi bi-square" /> Square
                            </button>
                            <button
                                onClick={() => addNode("Rectangle", "yellow")}
                                className="flex items-center gap-2 btn-outline-light btn-sm btn"
                            >
                                <i className="bi-aspect-ratio bi" /> Rectangle
                            </button>
                            <button
                                onClick={() => addNode("Oval", "lightcoral")}
                                className="flex items-center gap-2 btn-outline-light btn-sm btn"
                            >
                                <i className="bi bi-circle" /> Oval
                            </button>
                            <button
                                onClick={() => addNode("Pentagon", "red")}
                                className="flex items-center gap-2 btn-outline-light btn-sm btn"
                            >
                                <i className="bi bi-pentagon" /> Pentagon
                            </button>
                            <button
                                onClick={() => addNode("Hexagon", "purple")}
                                className="flex items-center gap-2 btn-outline-light btn-sm btn"
                            >
                                <i className="bi bi-hexagon" /> Hexagon
                            </button>
                            <button
                                onClick={handleFreeShapeAdd}
                                className="flex items-center gap-2 btn-outline-light btn-sm btn"
                            >
                                <i className="bi bi-diamond" /> Free Shape
                            </button>
                        </div>
                        <hr className="my-1" />

                        <h4 className="font-bold text-xl text-capitalize">
                            Actions 
                        </h4>
                        <button
                            onClick={deleteSelectedNodes}
                            className="flex items-center gap-2 mb-2 btn-outline-danger btn-sm btn"
                        >
                            <i className="bi bi-trash" /> Delete Selected
                        </button>
                        <button
                            onClick={exportFlowchart}
                            className="flex items-center gap-2 mb-2 btn-outline-primary btn-sm btn"
                        >
                            <i className="bi bi-upload" /> Export
                        </button>
                        <input
                            type="file"
                            accept="application/json"
                            onChange={importFlowchart}
                            className="my-2 form-control"
                        />
                        <hr className="my-2" />
                    </motion.div>
                )}

                <div className="flex-1 bg-gray-100 p-6">
                    {openIcon &&(
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-row md:flex-row justify-center gap-2 md:space-x-4 mb-1"
                        >
                            <input
                                type="text"
                                value={newText}
                                onChange={(e) => setNewText(e.target.value)}
                                placeholder="Enter text for node"
                                className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full md:w-1/3"
                            />
                            <button
                                onClick={updateTextInNode}
                                className="flex justify-center items-center bg-blue-500 px-4 py-2 rounded-md text-white btn btn-sm btn-primary"
                            >
                                <FaSearch className="mr-2" /> Update Text
                            </button>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Enter topic to generate flowchart"
                                className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 w-full md:w-1/3"
                            />
                            <button
                                onClick={generateFlowchartInZigzag}
                                className="flex justify-center items-center bg-green-500 px-4 py-2 rounded-md text-white btn btn-sm btn-success"
                            >
                                <FaSearch className="mr-2" /> Generate Flowchart
                            </button>
                        </motion.div>
                    )}
                    <div className="flowchart-container" style={{ height: "100dvh" }}>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            nodeTypes={nodeTypes}
                            onNodeClick={handleNodeClick}
                            onNodeDoubleClick={handleNodeDoubleClick}
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
                            nodeStrokeColo="transparent"
                            nodeColor="#000"
                            nodeBorderRadius={12}
                            />
                            <Controls />
                            <Background variant="lines"/>
                            
                        </ReactFlow>
                    </div>
                </div>

                {/* Sidebar Button */}
                <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    onClick={toggleSidebar}
                    className="top-4 right-4 z-50 fixed bg-blue-500 shadow-lg p-3 rounded-full text-white"
                >
                    {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </motion.button>

                {/* Right Sidebar */}
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: sidebarOpen ? 0 : "100%" }}
                    transition={{ duration: 0.5 }}
                    className="top-0 right-0 fixed bg-white shadow-lg w-full md:w-1/4 h-full overflow-scroll"
                >
                    <div className="p-4">
                        <section style={{ backgroundColor: "#caffbf", padding: "1rem", borderRadius: "12px" }}>
                            <h2 className="mb-4 font-bold text-2xl">
                                Selected Node Details
                            </h2>
                            <p className="text-gray-600">
                                {loading ? "Loading..." : generatedContent || "Click a node and then click 'Generate Content' to see details"}
                            </p>
                            {selectedNode && (
                                <button
                                    onClick={generateContentForSelectedNode}
                                    className="bg-blue-500 mt-4 px-4 py-2 rounded-md text-white"
                                >
                                    Generate Content
                                </button>
                            )}
                        </section>
                    </div>
                    <div className="p-4">
                        <section style={{ backgroundColor: "#a0c4ff", padding: "1rem", borderRadius: "12px" }}>
                            <h2 className="mb-4 font-bold text-2xl">
                                Search Content
                            </h2>
                            <input
                                type="search"
                                placeholder="Search for content"
                                className="form-control"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                className="bg-blue-500 mt-4 px-4 py-2 rounded-md text-white"
                                onClick={handleSearch}
                            >
                                Search
                            </button>
                            <div className="mt-4">
                                {searchLoading ? "Loading..." : searchResult}
                            </div>
                        </section>
                    </div>
                </motion.div>
            </div>
            {/* Free Shape Popup */}
            {showFreeShapePopup && (
                <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-white shadow-lg p-6 rounded-lg w-full max-w-md">
                        <h2 className="mb-4 font-bold text-xl">Adjust size</h2>
                        <input
                            type="text"
                            placeholder="Width (e.g., 650px)"
                            value={freeShapeWidth}
                            onChange={(e) => setFreeShapeWidth(e.target.value)}
                            className="mb-2 form-control"
                        />
                        <input
                            type="text"
                            placeholder="Height (e.g., auto)"
                            value={freeShapeHeight}
                            onChange={(e) => setFreeShapeHeight(e.target.value)}
                            className="mb-4 form-control"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowFreeShapePopup(false)}
                                className="btn btn-danger btn-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddFreeShape}
                                className="btn btn-primary btn-sm"
                            >
                                Add Free Shape
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ReactFlowProvider>
    );
}

export default FlowchartEditor;
