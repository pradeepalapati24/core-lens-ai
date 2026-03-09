import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FolderOpen, Github, Trash2, Edit2, X, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface UserProject {
  id: string;
  name: string;
  description: string | null;
  tech_stack: string[];
  github_url: string | null;
  created_at: string;
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<UserProject | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [githubUrl, setGithubUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("user_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProjects(data as UserProject[]);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setTechStack([]);
    setTechInput("");
    setGithubUrl("");
    setEditingProject(null);
  };

  const openEdit = (project: UserProject) => {
    setEditingProject(project);
    setName(project.name);
    setDescription(project.description || "");
    setTechStack(project.tech_stack || []);
    setGithubUrl(project.github_url || "");
    setDialogOpen(true);
  };

  const addTech = () => {
    const trimmed = techInput.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed]);
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter(t => t !== tech));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTech();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    if (editingProject) {
      const { error } = await supabase
        .from("user_projects")
        .update({ name, description, tech_stack: techStack, github_url: githubUrl || null, updated_at: new Date().toISOString() })
        .eq("id", editingProject.id);

      if (error) toast.error("Failed to update project");
      else toast.success("Project updated!");
    } else {
      const { error } = await supabase
        .from("user_projects")
        .insert({ user_id: user.id, name, description, tech_stack: techStack, github_url: githubUrl || null });

      if (error) toast.error("Failed to create project");
      else toast.success("Project created!");
    }

    setSaving(false);
    setDialogOpen(false);
    resetForm();
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("user_projects").delete().eq("id", id);
    if (error) toast.error("Failed to delete project");
    else {
      toast.success("Project deleted");
      fetchProjects();
    }
  };

  const startPractice = (project: UserProject) => {
    navigate("/practice", {
      state: {
        projectMode: true,
        projectId: project.id,
        projectName: project.name,
        projectDescription: project.description,
        projectTechStack: project.tech_stack,
      },
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add your projects to get personalized interview questions
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Project" : "Add New Project"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Project Name *</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. E-Commerce Platform" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what your project does, its architecture, key features..."
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Technology Stack</label>
                <div className="flex gap-2">
                  <Input
                    value={techInput}
                    onChange={e => setTechInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. React, Node.js, PostgreSQL"
                  />
                  <Button type="button" variant="secondary" onClick={addTech} size="sm">Add</Button>
                </div>
                {techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {techStack.map(tech => (
                      <Badge key={tech} variant="secondary" className="gap-1 pr-1">
                        {tech}
                        <button onClick={() => removeTech(tech)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  <Github className="h-3.5 w-3.5 inline mr-1" /> GitHub URL (optional)
                </label>
                <Input
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/user/repo"
                />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? "Saving..." : editingProject ? "Update Project" : "Create Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading projects...</div>
      ) : projects.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
          <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No projects yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Add your projects to generate tailored interview questions based on your actual tech stack and experience.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence>
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(project)} className="p-1.5 rounded-md hover:bg-accent">
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => handleDelete(project.id)} className="p-1.5 rounded-md hover:bg-destructive/10">
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                    )}
                    {project.tech_stack?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.tech_stack.map(tech => (
                          <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                        ))}
                      </div>
                    )}
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        <Github className="h-3 w-3" /> View on GitHub
                      </a>
                    )}
                    <Button size="sm" variant="secondary" className="w-full gap-1.5 mt-2" onClick={() => startPractice(project)}>
                      <Sparkles className="h-3.5 w-3.5" /> Practice with this Project
                      <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
