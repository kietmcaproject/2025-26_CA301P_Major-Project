import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Users, Target, TrendingUp, Award, Building, Calendar } from "lucide-react";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

function AnimatedCounter({ end, duration = 2, prefix = "", suffix = "" }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const startTime = Date.now();
      const endTime = startTime + duration * 1000;

      const updateCount = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / (endTime - startTime), 1);
        const currentCount = Math.floor(progress * end);
        
        setCount(currentCount);
        
        if (progress < 1) {
          requestAnimationFrame(updateCount);
        }
      };

      updateCount();
    }
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export function AnimatedStats() {
  const stats = [
    {
      label: "Interviews Tracked",
      value: 25000,
      suffix: "+",
      icon: Target,
      color: "text-primary"
    },
    {
      label: "Success Rate Improved",
      value: 85,
      suffix: "%",
      icon: TrendingUp,
      color: "text-secondary"
    },
    {
      label: "Active Job Seekers",
      value: 5000,
      suffix: "+",
      icon: Users,
      color: "text-accent"
    },
    {
      label: "Companies Hiring",
      value: 1200,
      suffix: "+",
      icon: Building,
      color: "text-support"
    },
    {
      label: "Success Stories",
      value: 850,
      suffix: "+",
      icon: Award,
      color: "text-success"
    },
    {
      label: "Hours Saved",
      value: 15000,
      suffix: "+",
      icon: Calendar,
      color: "text-warning"
    }
  ];

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">
            Trusted by <span className="text-gradient">Thousands</span> of Job Seekers
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join the growing community of professionals who have transformed their interview success with IntervuIQ
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="text-center group"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                  <stat.icon className={`w-6 h-6 ${stat.color} group-hover:scale-110 transition-transform`} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  <AnimatedCounter 
                    end={stat.value} 
                    suffix={stat.suffix}
                    duration={2.5}
                  />
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}