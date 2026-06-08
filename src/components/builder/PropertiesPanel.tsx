import { Settings, Image as ImageIcon } from "lucide-react";

interface PropertiesPanelProps {
  selectedBlock: any;
  updateBlockContent: (id: string, newContent: any) => void;
  generateBio: () => void;
  isGeneratingBio: boolean;
  uploadingState: { [key: string]: boolean };
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, blockId: string, path: string, arrayIndex?: number) => void;
}

export function PropertiesPanel({
  selectedBlock,
  updateBlockContent,
  generateBio,
  isGeneratingBio,
  uploadingState,
  handleFileUpload
}: PropertiesPanelProps) {
  if (!selectedBlock) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <p className="text-xs text-muted-foreground">Select an element to edit its properties.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Block Type</h3>
        <div className="px-3 py-2 bg-secondary/50 rounded-md text-sm font-medium capitalize">{selectedBlock.type}</div>
      </div>

      {selectedBlock.type === "heading" && (
        <div className="space-y-2">
          <label className="text-xs font-medium">Text</label>
          <input
            type="text"
            value={selectedBlock.content?.text || ""}
            onChange={(e) => updateBlockContent(selectedBlock.id, { text: e.target.value })}
            className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      {selectedBlock.type === "bio" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium">Name</label>
            <input
              type="text"
              value={selectedBlock.content?.name || ""}
              onChange={(e) => updateBlockContent(selectedBlock.id, { name: e.target.value })}
              className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Bio Description</label>
              <button
                onClick={generateBio}
                disabled={isGeneratingBio}
                className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                {isGeneratingBio ? "Generating..." : "✨ AI Magic"}
              </button>
            </div>
            <textarea
              value={selectedBlock.content?.description || ""}
              onChange={(e) => updateBlockContent(selectedBlock.id, { description: e.target.value })}
              className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md min-h-[120px] focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Image URL or Upload</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedBlock.content?.imageUrl || ""}
                onChange={(e) => updateBlockContent(selectedBlock.id, { imageUrl: e.target.value })}
                className="flex-1 text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://..."
              />
              <label className="cursor-pointer bg-secondary px-3 py-2 rounded-md flex items-center justify-center hover:bg-secondary/80">
                {uploadingState[`${selectedBlock.id}-imageUrl-0`] ? <span className="text-[10px]">...</span> : <ImageIcon className="w-4 h-4" />}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, selectedBlock.id, 'imageUrl')} />
              </label>
            </div>
          </div>
        </div>
      )}

      {selectedBlock.type === "experience" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium">Job Title</label>
            <input
              type="text"
              value={selectedBlock.content?.title || ""}
              onChange={(e) => updateBlockContent(selectedBlock.id, { title: e.target.value })}
              className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Logo URL or Upload</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedBlock.content?.logoUrl || ""}
                onChange={(e) => updateBlockContent(selectedBlock.id, { logoUrl: e.target.value })}
                className="flex-1 text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://..."
              />
              <label className="cursor-pointer bg-secondary px-3 py-2 rounded-md flex items-center justify-center hover:bg-secondary/80">
                {uploadingState[`${selectedBlock.id}-logoUrl-0`] ? <span className="text-[10px]">...</span> : <ImageIcon className="w-4 h-4" />}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, selectedBlock.id, 'logoUrl')} />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Company</label>
            <input
              type="text"
              value={selectedBlock.content?.company || ""}
              onChange={(e) => updateBlockContent(selectedBlock.id, { company: e.target.value })}
              className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Period</label>
            <input
              type="text"
              value={selectedBlock.content?.period || ""}
              onChange={(e) => updateBlockContent(selectedBlock.id, { period: e.target.value })}
              className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Description</label>
            <textarea
              value={selectedBlock.content?.description || ""}
              onChange={(e) => updateBlockContent(selectedBlock.id, { description: e.target.value })}
              className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md min-h-[80px] focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
        </div>
      )}

      {selectedBlock.type === "gallery" && (
        <div className="space-y-4">
          <h4 className="text-xs font-medium">Image URLs or Uploads</h4>
          {(selectedBlock.content?.images || ["", "", ""]).map((url: string, index: number) => (
            <div key={index} className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase">Image {index + 1}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    const newImages = [...(selectedBlock.content?.images || ["", "", ""])];
                    newImages[index] = e.target.value;
                    updateBlockContent(selectedBlock.id, { images: newImages });
                  }}
                  className="flex-1 text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="https://..."
                />
                <label className="cursor-pointer bg-secondary px-3 py-2 rounded-md flex items-center justify-center hover:bg-secondary/80">
                  {uploadingState[`${selectedBlock.id}-images-${index}`] ? <span className="text-[10px]">...</span> : <ImageIcon className="w-4 h-4" />}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, selectedBlock.id, 'images', index)} />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBlock.type === "projects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium">Projects</h4>
            <button
              onClick={() => {
                const newItems = [...(selectedBlock.content?.items || []), { name: "", desc: "", link: "" }];
                updateBlockContent(selectedBlock.id, { items: newItems });
              }}
              className="text-[10px] bg-secondary px-2 py-1 rounded"
            >+ Add</button>
          </div>
          {(selectedBlock.content?.items || []).map((item: any, index: number) => (
            <div key={index} className="p-3 border border-border rounded-md space-y-2 bg-secondary/20">
              <input
                type="text" placeholder="Name" value={item.name}
                onChange={(e) => {
                  const newItems = [...selectedBlock.content.items];
                  newItems[index].name = e.target.value;
                  updateBlockContent(selectedBlock.id, { items: newItems });
                }}
                className="w-full text-xs px-2 py-1 bg-background border border-border rounded"
              />
              <input
                type="text" placeholder="Description" value={item.desc}
                onChange={(e) => {
                  const newItems = [...selectedBlock.content.items];
                  newItems[index].desc = e.target.value;
                  updateBlockContent(selectedBlock.id, { items: newItems });
                }}
                className="w-full text-xs px-2 py-1 bg-background border border-border rounded"
              />
              <input
                type="text" placeholder="Link URL" value={item.link}
                onChange={(e) => {
                  const newItems = [...selectedBlock.content.items];
                  newItems[index].link = e.target.value;
                  updateBlockContent(selectedBlock.id, { items: newItems });
                }}
                className="w-full text-xs px-2 py-1 bg-background border border-border rounded"
              />
              <button onClick={() => {
                const newItems = [...selectedBlock.content.items];
                newItems.splice(index, 1);
                updateBlockContent(selectedBlock.id, { items: newItems });
              }} className="text-[10px] text-destructive">Remove</button>
            </div>
          ))}
        </div>
      )}

      {selectedBlock.type === "twitter" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium">Username</label>
            <input
              type="text"
              value={selectedBlock.content?.username || ""}
              onChange={(e) => updateBlockContent(selectedBlock.id, { username: e.target.value })}
              className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Tweet URL (Optional Embed)</label>
            <input
              type="text"
              value={selectedBlock.content?.tweetUrl || ""}
              onChange={(e) => updateBlockContent(selectedBlock.id, { tweetUrl: e.target.value })}
              className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md"
            />
          </div>
        </div>
      )}

      {selectedBlock.type === "spotify" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium">Spotify Embed URL</label>
            <input
              type="text"
              value={selectedBlock.content?.embedUrl || ""}
              onChange={(e) => updateBlockContent(selectedBlock.id, { embedUrl: e.target.value })}
              className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md"
              placeholder="https://open.spotify.com/embed/..."
            />
            <p className="text-[10px] text-muted-foreground">Go to Spotify -&gt; Share -&gt; Embed Track/Playlist, and copy the `src` URL.</p>
          </div>
        </div>
      )}

      {selectedBlock.type === "github" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium">GitHub Username</label>
            <input
              type="text"
              value={selectedBlock.content?.username || ""}
              onChange={(e) => updateBlockContent(selectedBlock.id, { username: e.target.value })}
              className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium">Repositories</h4>
            <button
              onClick={() => {
                const newRepos = [...(selectedBlock.content?.repos || []), { name: "", desc: "", stars: 0, forks: 0 }];
                updateBlockContent(selectedBlock.id, { repos: newRepos });
              }}
              className="text-[10px] bg-secondary px-2 py-1 rounded"
            >+ Add</button>
          </div>
          {(selectedBlock.content?.repos || []).map((repo: any, index: number) => (
            <div key={index} className="p-3 border border-border rounded-md space-y-2 bg-secondary/20">
              <input
                type="text" placeholder="Repo Name" value={repo.name}
                onChange={(e) => {
                  const newRepos = [...selectedBlock.content.repos];
                  newRepos[index].name = e.target.value;
                  updateBlockContent(selectedBlock.id, { repos: newRepos });
                }}
                className="w-full text-xs px-2 py-1 bg-background border border-border rounded"
              />
              <input
                type="text" placeholder="Description" value={repo.desc}
                onChange={(e) => {
                  const newRepos = [...selectedBlock.content.repos];
                  newRepos[index].desc = e.target.value;
                  updateBlockContent(selectedBlock.id, { repos: newRepos });
                }}
                className="w-full text-xs px-2 py-1 bg-background border border-border rounded"
              />
              <div className="flex gap-2">
                <input
                  type="number" placeholder="Stars" value={repo.stars}
                  onChange={(e) => {
                    const newRepos = [...selectedBlock.content.repos];
                    newRepos[index].stars = parseInt(e.target.value) || 0;
                    updateBlockContent(selectedBlock.id, { repos: newRepos });
                  }}
                  className="w-1/2 text-xs px-2 py-1 bg-background border border-border rounded"
                />
                <input
                  type="number" placeholder="Forks" value={repo.forks}
                  onChange={(e) => {
                    const newRepos = [...selectedBlock.content.repos];
                    newRepos[index].forks = parseInt(e.target.value) || 0;
                    updateBlockContent(selectedBlock.id, { repos: newRepos });
                  }}
                  className="w-1/2 text-xs px-2 py-1 bg-background border border-border rounded"
                />
              </div>
              <button onClick={() => {
                const newRepos = [...selectedBlock.content.repos];
                newRepos.splice(index, 1);
                updateBlockContent(selectedBlock.id, { repos: newRepos });
              }} className="text-[10px] text-destructive">Remove</button>
            </div>
          ))}
        </div>
      )}

      {selectedBlock.type === "skills" && (
        <div className="space-y-4">
          <h4 className="text-xs font-medium">Skills (comma separated)</h4>
          <textarea
            value={(selectedBlock.content?.skills || []).join(", ")}
            onChange={(e) => {
              const skills = e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean);
              updateBlockContent(selectedBlock.id, { skills });
            }}
            className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md min-h-[80px]"
          />
        </div>
      )}

      {selectedBlock.type === "social" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium">Links</h4>
            <button
              onClick={() => {
                const newLinks = [...(selectedBlock.content?.links || []), { platform: "New Link", url: "" }];
                updateBlockContent(selectedBlock.id, { links: newLinks });
              }}
              className="text-[10px] bg-secondary px-2 py-1 rounded"
            >+ Add</button>
          </div>
          {(selectedBlock.content?.links || []).map((link: any, index: number) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text" placeholder="Platform" value={link.platform}
                onChange={(e) => {
                  const newLinks = [...selectedBlock.content.links];
                  newLinks[index].platform = e.target.value;
                  updateBlockContent(selectedBlock.id, { links: newLinks });
                }}
                className="w-1/3 text-xs px-2 py-1 bg-background border border-border rounded"
              />
              <input
                type="text" placeholder="URL" value={link.url}
                onChange={(e) => {
                  const newLinks = [...selectedBlock.content.links];
                  newLinks[index].url = e.target.value;
                  updateBlockContent(selectedBlock.id, { links: newLinks });
                }}
                className="flex-1 text-xs px-2 py-1 bg-background border border-border rounded"
              />
              <button onClick={() => {
                const newLinks = [...selectedBlock.content.links];
                newLinks.splice(index, 1);
                updateBlockContent(selectedBlock.id, { links: newLinks });
              }} className="text-[10px] text-destructive">X</button>
            </div>
          ))}
        </div>
      )}

      {selectedBlock.type === "blog" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium">Section Title</label>
            <input
              type="text"
              value={selectedBlock.content?.title || ""}
              onChange={(e) => updateBlockContent(selectedBlock.id, { title: e.target.value })}
              className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md"
            />
          </div>
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium">Posts</h4>
            <button
              onClick={() => {
                const newPosts = [...(selectedBlock.content?.posts || []), { title: "New Post", date: new Date().toLocaleDateString(), content: "" }];
                updateBlockContent(selectedBlock.id, { posts: newPosts });
              }}
              className="text-[10px] bg-secondary px-2 py-1 rounded"
            >+ Add Post</button>
          </div>
          {(selectedBlock.content?.posts || []).map((post: any, index: number) => (
            <div key={index} className="p-3 border border-border rounded-md space-y-2 bg-secondary/20">
              <input
                type="text" placeholder="Title" value={post.title}
                onChange={(e) => {
                  const newPosts = [...selectedBlock.content.posts];
                  newPosts[index].title = e.target.value;
                  updateBlockContent(selectedBlock.id, { posts: newPosts });
                }}
                className="w-full text-xs px-2 py-1 bg-background border border-border rounded"
              />
              <input
                type="text" placeholder="Date" value={post.date}
                onChange={(e) => {
                  const newPosts = [...selectedBlock.content.posts];
                  newPosts[index].date = e.target.value;
                  updateBlockContent(selectedBlock.id, { posts: newPosts });
                }}
                className="w-full text-xs px-2 py-1 bg-background border border-border rounded"
              />
              <textarea
                placeholder="Content (Markdown supported in future)" value={post.content}
                onChange={(e) => {
                  const newPosts = [...selectedBlock.content.posts];
                  newPosts[index].content = e.target.value;
                  updateBlockContent(selectedBlock.id, { posts: newPosts });
                }}
                className="w-full text-xs px-2 py-1 bg-background border border-border rounded resize-none min-h-[60px]"
              />
              <button onClick={() => {
                const newPosts = [...selectedBlock.content.posts];
                newPosts.splice(index, 1);
                updateBlockContent(selectedBlock.id, { posts: newPosts });
              }} className="text-[10px] text-destructive">Remove Post</button>
            </div>
          ))}
        </div>
      )}

      {selectedBlock.type === "contact" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium">Title</label>
            <input
              type="text"
              value={selectedBlock.content?.title || ""}
              onChange={(e) => updateBlockContent(selectedBlock.id, { title: e.target.value })}
              className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Description</label>
            <input
              type="text"
              value={selectedBlock.content?.description || ""}
              onChange={(e) => updateBlockContent(selectedBlock.id, { description: e.target.value })}
              className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {selectedBlock.type === "testimonials" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium">Testimonials</h4>
            <button
              onClick={() => {
                const newItems = [...(selectedBlock.content?.items || []), { name: "", role: "", text: "" }];
                updateBlockContent(selectedBlock.id, { items: newItems });
              }}
              className="text-[10px] bg-secondary px-2 py-1 rounded"
            >+ Add</button>
          </div>
          {(selectedBlock.content?.items || []).map((item: any, index: number) => (
            <div key={index} className="p-3 border border-border rounded-md space-y-2 bg-secondary/20">
              <input
                type="text" placeholder="Name" value={item.name}
                onChange={(e) => {
                  const newItems = [...selectedBlock.content.items];
                  newItems[index].name = e.target.value;
                  updateBlockContent(selectedBlock.id, { items: newItems });
                }}
                className="w-full text-xs px-2 py-1 bg-background border border-border rounded"
              />
              <input
                type="text" placeholder="Role" value={item.role}
                onChange={(e) => {
                  const newItems = [...selectedBlock.content.items];
                  newItems[index].role = e.target.value;
                  updateBlockContent(selectedBlock.id, { items: newItems });
                }}
                className="w-full text-xs px-2 py-1 bg-background border border-border rounded"
              />
              <textarea
                placeholder="Quote text" value={item.text}
                onChange={(e) => {
                  const newItems = [...selectedBlock.content.items];
                  newItems[index].text = e.target.value;
                  updateBlockContent(selectedBlock.id, { items: newItems });
                }}
                className="w-full text-xs px-2 py-1 bg-background border border-border rounded resize-none min-h-[60px]"
              />
              <button onClick={() => {
                const newItems = [...selectedBlock.content.items];
                newItems.splice(index, 1);
                updateBlockContent(selectedBlock.id, { items: newItems });
              }} className="text-[10px] text-destructive">Remove</button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
