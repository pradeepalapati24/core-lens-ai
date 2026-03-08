import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useDomains, useTopics, useSubtopics } from "@/hooks/useDomains";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Swords, Link2, UserPlus, Copy, Check, Loader2, Trophy, Clock, ArrowRight, Users, Share2, Search,
} from "lucide-react";

export default function ChallengePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const joinCode = searchParams.get("code");

  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<"create" | "active" | "join">(joinCode ? "join" : "create");
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create challenge state
  const { data: domains = [] } = useDomains();
  const [selectedDomainId, setSelectedDomainId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [selectedSubtopicId, setSelectedSubtopicId] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [creating, setCreating] = useState(false);
  const [createdShareCode, setCreatedShareCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // In-app invite state
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviteMode, setInviteMode] = useState<"link" | "user">("link");

  // Join state
  const [joinCodeInput, setJoinCodeInput] = useState(joinCode || "");
  const [joining, setJoining] = useState(false);

  const { data: topics = [] } = useTopics(selectedDomainId || null);
  const { data: subtopics = [] } = useSubtopics(selectedTopicId || null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchChallenges(user.id);
      }
      setLoading(false);
    };
    init();
  }, []);

  const fetchChallenges = async (uid: string) => {
    const { data } = await supabase
      .from("challenges" as any)
      .select("*")
      .or(`challenger_id.eq.${uid},challenged_id.eq.${uid}`)
      .order("created_at", { ascending: false })
      .limit(20);
    setChallenges((data as any[]) || []);
  };

  const searchUsers = async () => {
    if (!searchUsername.trim()) return;
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .ilike("username", `%${searchUsername}%`)
      .neq("id", userId)
      .limit(5);
    setSearchResults(data || []);
    setSearching(false);
  };

  const createChallenge = async (challengedId?: string) => {
    if (!userId || !selectedDomainId) return;
    setCreating(true);
    
    const domain = domains.find(d => d.id === selectedDomainId);
    const { data, error } = await supabase
      .from("challenges" as any)
      .insert({
        challenger_id: userId,
        challenged_id: challengedId || null,
        domain_id: selectedDomainId,
        topic_id: selectedTopicId || null,
        subtopic_id: selectedSubtopicId || null,
        difficulty,
      } as any)
      .select()
      .single();

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create challenge." });
    } else {
      const d = data as any;
      setCreatedShareCode(d.share_code);
      toast({ title: "Challenge created!", description: challengedId ? "Challenge sent!" : "Share the link with your friend." });
      if (userId) fetchChallenges(userId);
    }
    setCreating(false);
  };

  const joinChallenge = async () => {
    if (!userId || !joinCodeInput.trim()) return;
    setJoining(true);
    
    const { data: challenge, error: findError } = await supabase
      .from("challenges" as any)
      .select("*")
      .eq("share_code", joinCodeInput.trim())
      .single();

    if (findError || !challenge) {
      toast({ variant: "destructive", title: "Not found", description: "Invalid challenge code." });
      setJoining(false);
      return;
    }

    const c = challenge as any;
    if (c.challenger_id === userId) {
      toast({ variant: "destructive", title: "Error", description: "You can't join your own challenge!" });
      setJoining(false);
      return;
    }

    const { error } = await supabase
      .from("challenges" as any)
      .update({ challenged_id: userId, status: "accepted" } as any)
      .eq("id", c.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to join challenge." });
    } else {
      toast({ title: "Challenge accepted!", description: "Navigate to practice to start." });
      navigate("/practice", {
        state: { selectedDomainId: c.domain_id },
      });
    }
    setJoining(false);
  };

  const copyLink = (code: string) => {
    const url = `${window.location.origin}/challenge?code=${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: "Link copied!", description: "Share this with your friend." });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!userId) {
    return <div className="p-8 text-center"><p className="text-muted-foreground">Please sign in to use challenges.</p><Button onClick={() => navigate("/auth")} className="mt-4">Sign In</Button></div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Swords className="w-7 h-7 text-primary" />
          <h1 className="text-[28px] font-semibold">Challenge a Friend</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">Compete on the same topic and compare scores</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["create", "active", "join"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground bg-muted/30"}`}>
            {t === "create" ? "Create Challenge" : t === "active" ? `My Challenges (${challenges.length})` : "Join Challenge"}
          </button>
        ))}
      </div>

      {/* Create Tab */}
      {tab === "create" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {createdShareCode ? (
            <div className="surface-elevated p-8 text-center">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Challenge Created!</h2>
              <p className="text-sm text-muted-foreground mb-6">Share this link with your friend:</p>
              <div className="flex items-center gap-2 max-w-md mx-auto bg-muted/30 rounded-lg p-3 border border-border">
                <code className="flex-1 text-sm text-foreground truncate">{window.location.origin}/challenge?code={createdShareCode}</code>
                <Button size="sm" variant="outline" onClick={() => copyLink(createdShareCode)}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Button className="mt-6" onClick={() => { setCreatedShareCode(null); setTab("active"); }}>
                View My Challenges
              </Button>
            </div>
          ) : (
            <>
              {/* Mode toggle */}
              <div className="flex gap-3">
                <button onClick={() => setInviteMode("link")}
                  className={`flex-1 p-4 rounded-lg border text-center transition-all ${inviteMode === "link" ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                  <Link2 className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium">Share Link</div>
                  <p className="text-[11px] text-muted-foreground">Anyone with the link can join</p>
                </button>
                <button onClick={() => setInviteMode("user")}
                  className={`flex-1 p-4 rounded-lg border text-center transition-all ${inviteMode === "user" ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                  <UserPlus className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium">Invite User</div>
                  <p className="text-[11px] text-muted-foreground">Search by username</p>
                </button>
              </div>

              {/* Domain/Topic selection */}
              <div className="surface-elevated p-6 space-y-4">
                <h3 className="text-sm font-medium">Challenge Topic</h3>
                <Select value={selectedDomainId} onValueChange={(v) => { setSelectedDomainId(v); setSelectedTopicId(""); setSelectedSubtopicId(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
                  <SelectContent>{domains.map(d => <SelectItem key={d.id} value={d.id}>{d.icon} {d.name}</SelectItem>)}</SelectContent>
                </Select>
                {topics.length > 0 && (
                  <Select value={selectedTopicId} onValueChange={(v) => { setSelectedTopicId(v); setSelectedSubtopicId(""); }}>
                    <SelectTrigger><SelectValue placeholder="Select topic (optional)" /></SelectTrigger>
                    <SelectContent>{topics.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                )}
                {subtopics.length > 0 && (
                  <Select value={selectedSubtopicId} onValueChange={setSelectedSubtopicId}>
                    <SelectTrigger><SelectValue placeholder="Select subtopic (optional)" /></SelectTrigger>
                    <SelectContent>{subtopics.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                )}
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* In-app user search */}
              {inviteMode === "user" && (
                <div className="surface-elevated p-6">
                  <h3 className="text-sm font-medium mb-3">Find User</h3>
                  <div className="flex gap-2">
                    <Input placeholder="Search username..." value={searchUsername} onChange={(e) => setSearchUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchUsers()} />
                    <Button variant="outline" onClick={searchUsers} disabled={searching}>
                      {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {searchResults.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                          <div>
                            <span className="text-sm font-medium">{u.display_name || u.username}</span>
                            <span className="text-xs text-muted-foreground ml-2">@{u.username}</span>
                          </div>
                          <Button size="sm" onClick={() => createChallenge(u.id)} disabled={creating}>
                            {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Challenge"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {inviteMode === "link" && (
                <Button className="w-full h-12" onClick={() => createChallenge()} disabled={creating || !selectedDomainId}>
                  {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                  Create & Get Share Link
                </Button>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Active Challenges Tab */}
      {tab === "active" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {challenges.length === 0 ? (
            <div className="surface-elevated p-8 text-center">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No challenges yet. Create one!</p>
            </div>
          ) : (
            challenges.map((c: any) => (
              <div key={c.id} className="surface-elevated p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      c.status === "completed" ? "bg-success/10 text-success" :
                      c.status === "accepted" ? "bg-primary/10 text-primary" :
                      "bg-warning/10 text-warning"
                    }`}>{c.status}</span>
                    <span className="text-xs text-muted-foreground">{c.difficulty}</span>
                  </div>
                  <p className="text-sm font-medium">Challenge #{c.share_code}</p>
                  {c.challenger_score != null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Your score: <span className="font-bold text-foreground">{Math.round(c.challenger_id === userId ? c.challenger_score * 10 : c.challenged_score * 10)}/100</span>
                      {c.status === "completed" && (
                        <span className="ml-2">vs <span className="font-bold">{Math.round(c.challenger_id === userId ? (c.challenged_score || 0) * 10 : c.challenger_score * 10)}/100</span></span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {c.status === "pending" && c.challenger_id === userId && (
                    <Button size="sm" variant="outline" onClick={() => copyLink(c.share_code)}>
                      <Copy className="w-3 h-3 mr-1" /> Share
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {/* Join Tab */}
      {tab === "join" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="surface-elevated p-8">
          <h2 className="text-lg font-semibold mb-2">Join a Challenge</h2>
          <p className="text-sm text-muted-foreground mb-6">Enter the challenge code shared by your friend</p>
          <div className="flex gap-3 max-w-md">
            <Input placeholder="Enter challenge code..." value={joinCodeInput} onChange={(e) => setJoinCodeInput(e.target.value)} />
            <Button onClick={joinChallenge} disabled={joining || !joinCodeInput.trim()}>
              {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4 mr-1" /> Join</>}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
