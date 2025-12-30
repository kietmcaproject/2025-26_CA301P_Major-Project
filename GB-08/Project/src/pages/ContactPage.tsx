import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success("Message sent successfully! We'll get back to you soon.");
    setName("");
    setEmail("");
    setMessage("");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gradient mb-4">Get in Touch</h1>
            <p className="text-muted-foreground text-lg">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-8 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us what's on your mind..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full transition-smooth hover:scale-[1.02]"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground">support@intervuiq.com</p>
                    <p className="text-muted-foreground">contact@intervuiq.com</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-secondary/10 to-primary/10 border-secondary/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-muted-foreground">Mon-Fri, 9am-6pm EST</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Office</h3>
                    <p className="text-muted-foreground">
                      123 Innovation Drive<br />
                      San Francisco, CA 94105<br />
                      United States
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 gradient-primary">
                <h3 className="text-white font-semibold mb-2">Business Hours</h3>
                <div className="space-y-1 text-white/90">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
