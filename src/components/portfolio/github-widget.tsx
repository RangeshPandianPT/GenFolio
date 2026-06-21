"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, GitFork, BookMarked, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Repository {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
}

interface GitHubWidgetProps {
  username: string;
  limit?: number;
}

export function GitHubWidget({ username, limit = 4 }: GitHubWidgetProps) {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepos() {
      if (!username) return;
      try {
        setLoading(true);
        const res = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=${limit}`);
        if (!res.ok) throw new Error("Failed to fetch repositories");
        const data = await res.json();
        setRepos(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, [username, limit]);

  if (!username) {
    return (
      <div className="flex items-center justify-center p-8 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/50 text-zinc-500">
        Enter a GitHub username to display top repositories
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-400 bg-red-950/20 border border-red-900/50 rounded-xl">
        Failed to load GitHub repositories: {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <BookMarked className="w-6 h-6 text-white" />
        <h3 className="text-2xl font-bold tracking-tight text-white">Top Repositories</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repos.map((repo, index) => (
          <motion.a
            key={repo.id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="block h-full"
          >
            <Card className="h-full bg-zinc-900/50 border-zinc-800/80 hover:bg-zinc-800/50 transition-all duration-300 backdrop-blur-sm group">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                  {repo.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-zinc-400 mt-1.5 h-10">
                  {repo.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-zinc-500">
                  {repo.language && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-blue-500/80"></span>
                      <span>{repo.language}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>{repo.stargazers_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="w-4 h-4" />
                    <span>{repo.forks_count}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
