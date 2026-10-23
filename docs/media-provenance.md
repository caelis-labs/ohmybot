# Website artwork and film provenance

## Character artwork

The site uses the released Caelis character artwork, not a product screenshot. Source: `caelis-labs/caelis-bot`, v0.15.2, `c6579eecb9da57a91090174b9a414750a3e3ef4f`, `frontend/public/models/caelis-garden-outfit-v1.glb`. The model, identity and materials are unchanged; the original website Blender camera/light setup renders its idle pose, then WebP derivatives are resized/compressed. Asset license and upstream attribution remain in `public/assets/bot/`.

The redesigned page uses the full, proportionate character as the hero anchor and inside the Worker card illustration. CSS transforms do not change its anatomy, pose or rig. The small Bot mark remains the existing owner-selected logo.

## Product illustrations

The three scroll-story scenes are **HTML/CSS illustrations with synthetic data**, not native screenshots. They are labelled “Illustrative interface · synthetic data” / “界面示意 · 合成数据”. The interactive Attach/hide terminal card, Bot answering a Codex Worker, and tool-result condition flow explain workflows without claiming measured execution speed or exact native UI fidelity.

`TODO(real-capture)` in `BotLanding.astro` marks the intended native-media replacement. Any replacement must use synthetic data, be reviewed for privacy, and update alternative text and provenance before the illustrative label changes.

## V3.1 film

English and Chinese, each with a 1920×1080 desktop and separately composed 1080×1350 mobile cut: 48 seconds, H.264/yuv420p, 30 fps, no audio. Twelve integrated files and exact SHA-256 values are recorded in `src/data/bot-media.json`. These are creative compositions of the released character and fictional example workflows, not native recordings or measured execution-speed claims.

The film is retained as a **secondary brand film**, not as the page's product proof. It is explicitly labelled “Brand film · illustrative, not a live recording” / “品牌短片 · 示意内容，非现场录屏”. `TODO(real-demo)` marks the intended replacement: a 20–30 second native screen recording of Worker assignment → Bot answering a Worker question → Attach/hide while the task continues.

The film uses the same released character GLB, an existing nod clip with a presentation-only lowered upper-arm pose in the final brand scene, Manrope and Noto Sans SC. The original GLB mesh, weights, hands and textures are unchanged; this artwork pose is not a new product feature. Website publication includes only the final MP4/WebP/VTT assets and character license/attribution, not production profiles or raw source models.

## Responsive player contract

Each locale has a desktop `base` and optional `mobileBase`. A separate mobile composition is selected when opening the player at <=700px. Matching poster/VTT are selected with the source; resizing does not interrupt playback. Native captions default off. Native fullscreen is attempted; if the browser declines, a reversible viewport-expanded view remains usable. This fallback is not proof of real iOS/Android fullscreen.

No private account, chat, key or local user path appears in the site assets.

The terminal interaction only toggles local illustrative markup. It does not launch a runtime, create work, or represent a live execution receipt. Result-based follow-ups support custom authorized scripts and tools exposed through selected Bot plugin connections, with a configured condition. They are not automatic callbacks on every runtime tool invocation. The file-arrival example is synthetic and does not claim a bundled file-watching integration.

## Native reference update (2026-10-23)

`native-task-card.png` is the unmodified native screenshot supplied by the user for this website. It is displayed as an actual screenshot, including the original task text. The hero bubble follows this screenshot's pill geometry. The question scene uses the structure and visual rules of Caelis Bot `frontend/src/QuestionPrompt.tsx` and `style.css` at 28d2394b, with synthetic website-task text. Its question/approval transition is a local creative demonstration, not a native receipt or live approval. The event scene is an illustrative remote-test follow-up workflow, not a claimed completed run.

The brand film is removed from the page and `ready` is false; its existing files remain archived in the repository.

## Component composition revision

The supplied screenshot is no longer rendered on the page. Its bubble, pet and translucent task-card vocabulary is rebuilt as responsive HTML/CSS with synthetic task content. The question demonstration explicitly separates initial delegation from a later execution question, followed by Bot reasoning and an in-scope confirmation. No native execution or approval is performed.

Hero and scene character derivatives were rerendered from the finished public GLB in Caelis Bot 28d2394b: orthographic near-front camera (0.2, -5, 1.12), 23-degree downward upper-arm pose adjustment, 1000x1400, Cycles 32 samples. Meshes, materials and character identity are unchanged; no authoring sources are added.

2026-10-23: Updated the existing finished GLB portrait by aligning each hand with its forearm for straight, relaxed wrists. No mesh or character identity changes. Question and test-result examples now play automatically on entering view, pause while hidden, and show their completed state with reduced motion. These are frontend illustrations, not live approvals. Website-only changes do not alter Bot skills or runtime behavior.

2026-10-23: chat-approval-zh.mp4 and chat-approval-en.mp4 are 480×520 browser captures of the unchanged Bot App production History/Prompt/portrait components at source 28d2394b17dcd1c6fd465e6f9036ca3d1b831691. Synthetic snapshots drive the sequence through an inert transport; no real tasks or approvals execute. The page labels actual App UI with an example task, not native live-task evidence. Reproduction inputs are in scripts/bot-chat-film/.

2026-10-23: All three homepage examples now render live DOM/CSS/SVG through ProductDemo.astro, with message/approval styling based on the App UI. They are website simulations, not the production React component or native execution. No embedded videos or screenshot frames are used. Each timeline begins only after its full frame is visible below the header, pauses outside view, and has pause/replay controls. Bot runtime and skills are unchanged. Previous rendered films remain unreferenced source artifacts.

The live demos now loop automatically with a 3.2-second completion hold; offscreen and reduced-motion handling remains. Playback controls and visible explanatory captions were removed. Chat bubbles and question choices follow Bot's `frontend/src/style.css`; `chat-avatar.png` is the unmodified built-in portrait poster from `frontend/public/portraits/caelis-sage-v1/poster.png`. Stacked task cards illustrate concurrent work with synthetic task content. This changes only the website; Bot skill guidance is unaffected.

The homepage and task demonstration now use companion-idle-600.webp. Its pose is computed by the App PoseLayer.settle() (NearGesturePose and HandPoseLayer) using the finished GLB's authored rest metadata. No manually invented arm or wrist rotations are applied. The resulting posed finished model is rendered as a static transparent image; the website does not run the App's 3D idle loop. Download is a plain peer navigation link, and the choice message now explains the remembered preference. Bot behavior and skill guidance are unchanged.
