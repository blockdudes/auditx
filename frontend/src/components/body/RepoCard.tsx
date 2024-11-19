// /components/RepoCard.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Github, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RepoCard({
  logo,
  name,
  owner,
  status,
  reward,
  postedTime,
  description,
  repoUrl,
}: {
  logo: string;
  name: string;
  owner: string;
  status: string;
  reward: string;
  postedTime: string;
  description: string;
  repoUrl: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="p-6 hover:shadow-md transition-shadow">
        <div className="flex gap-4">
          <Image
            src={logo}
            alt={`${owner} logo`}
            width={48}
            height={48}
            className="rounded-md"
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">{name}</h3>
                <p className="text-sm text-muted-foreground">{owner}</p>
              </div>
              <Link
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                <Github className="inline-block w-4 h-4 mr-1" />
                View Repo
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                {status}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                💰 {reward}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">Posted {postedTime}</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                Apply for Audit
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
