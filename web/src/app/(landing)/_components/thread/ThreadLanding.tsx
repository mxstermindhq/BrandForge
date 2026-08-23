import { ThreadArtifact } from "./ThreadArtifact";
import { Reveal } from "./Reveal";
import { ThreadNav } from "./ThreadNav";
import "./thread.css";

const TICKER = [
  "MILESTONES",
  "ESCROW-HOLD",
  "@AI DRAFTS",
  "LIVE KANBAN",
  "CLIENT VIEW",
  "REALTIME SYNC",
  "ROLE-GATED",
  "PAID IN THREAD",
];

const STEPS = [
  {
    n: "01",
    title: "Start the thread",
    body: "Invite a client by email or link. The workspace is the chat — no dashboards to explain, no install on their side.",
  },
  {
    n: "02",
    title: "Agree the milestone",
    body: "Quote a deliverable with a price. The quote becomes an escrow line item both sides can see.",
  },
  {
    n: "03",
    title: "Fund and build",
    body: "The client funds the plate, work moves on the board, and @AI handles the back-and-forth. Release the money on delivery.",
  },
];

export function ThreadLanding() {
  return (
    <div className="thread-landing">
      <ThreadNav />

      <header className="tl-hero">
        <div className="tl-shell tl-hero-grid">
          <div className="tl-hero-copy">
            <p className="tl-eyebrow">BRANDFORGE · CLIENT WORKSPACE</p>
            <h1 className="tl-h1">
              Client work,<br />
              done in one thread.
            </h1>
            <p className="tl-lead">
              The conversation, the money, the plan, and an AI copilot — everything a
              client project needs lives in a single chat. Clients see it too. No
              invoices to chase, no status meetings.
            </p>
            <div className="tl-hero-actions">
              <a className="tl-btn tl-btn-primary" href="/signin">
                Start a thread
              </a>
              <a className="tl-btn tl-btn-ghost" href="#money">
                See how it starts
              </a>
            </div>
            <p className="tl-hero-note">Free to start · escrow-held payouts · no client install</p>
          </div>

          <div className="tl-hero-art">
            <ThreadArtifact />
          </div>
        </div>
      </header>

      <div className="tl-ticker" aria-hidden>
        <div className="tl-ticker-track">
          {[...TICKER, ...TICKER].map((item, i) => (
            <span className="tl-ticker-item" key={i}>
              {item}
              <span className="tl-ticker-dot">·</span>
            </span>
          ))}
        </div>
      </div>

      <main>
        <section id="money" className="tl-section">
          <div className="tl-shell tl-row">
            <Reveal className="tl-row-copy">
              <p className="tl-eyebrow">THE MONEY</p>
              <h2 className="tl-h2">Quotes become line items. Money stays visible.</h2>
              <p className="tl-body">
                Every milestone becomes an escrow line item inside the thread. Your
                client funds it, you release it on delivery — both sides watch the same
                plates. Nobody chases invoices, and nobody asks “where’s the money?”.
              </p>
            </Reveal>
            <Reveal className="tl-row-art" delay={120}>
              <div className="tl-card tl-plates">
                <div className="tl-card-head">
                  <span>ESCROW — NOVA STUDIO</span>
                  <span className="tl-total">$2,400 held</span>
                </div>
                <div className="tl-plate">
                  <div>
                    <div className="tl-plate-label">Landing page v1</div>
                    <div className="tl-plate-note">M1 · due Thursday</div>
                  </div>
                  <div className="tl-plate-right">
                    <span className="tl-amount">$1,200</span>
                    <span className="tl-pill tl-pill-funded">FUNDED</span>
                  </div>
                </div>
                <div className="tl-plate">
                  <div>
                    <div className="tl-plate-label">Brand identity</div>
                    <div className="tl-plate-note">M2 · next</div>
                  </div>
                  <div className="tl-plate-right">
                    <span className="tl-amount">$800</span>
                    <span className="tl-pill tl-pill-funded">FUNDED</span>
                  </div>
                </div>
                <div className="tl-plate">
                  <div>
                    <div className="tl-plate-label">Launch checklist</div>
                    <div className="tl-plate-note">M3 · after review</div>
                  </div>
                  <div className="tl-plate-right">
                    <span className="tl-amount">$400</span>
                    <span className="tl-pill tl-pill-pending">PENDING</span>
                  </div>
                </div>
                <div className="tl-plate-note tl-plate-foot">
                  Client funds plates from the thread. Founder releases on delivery.
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="plan" className="tl-section tl-section-alt">
          <div className="tl-shell tl-row">
            <Reveal className="tl-row-copy">
              <p className="tl-eyebrow">THE PLAN</p>
              <h2 className="tl-h2">The plan moves in the open.</h2>
              <p className="tl-body">
                Milestones and the kanban board sit right next to the chat. Clients
                watch cards move from backlog to done without a single status meeting —
                and you keep the whole project in one place.
              </p>
            </Reveal>
            <Reveal className="tl-row-art" delay={120}>
              <div className="tl-card tl-kanban">
                <div className="tl-kanban-cols">
                  <div className="tl-kcol">
                    <div className="tl-kcol-head">
                      <span>BACKLOG</span>
                      <span>1</span>
                    </div>
                    <div className="tl-ktask">
                      <div>Export assets</div>
                      <span className="tl-tag">M3</span>
                    </div>
                  </div>
                  <div className="tl-kcol">
                    <div className="tl-kcol-head">
                      <span>IN PROGRESS</span>
                      <span>2</span>
                    </div>
                    <div className="tl-ktask">
                      <div>Hero section build</div>
                      <span className="tl-tag">M1</span>
                    </div>
                    <div className="tl-ktask">
                      <div>Brand type scale</div>
                      <span className="tl-tag">M2</span>
                    </div>
                  </div>
                  <div className="tl-kcol">
                    <div className="tl-kcol-head">
                      <span>REVIEW</span>
                      <span>0</span>
                    </div>
                  </div>
                  <div className="tl-kcol">
                    <div className="tl-kcol-head">
                      <span>DONE</span>
                      <span>1</span>
                    </div>
                    <div className="tl-ktask tl-ktask-done">
                      <div>Wireframes</div>
                      <span className="tl-tag">M1</span>
                    </div>
                  </div>
                </div>
                <div className="tl-kanban-foot tl-plate-note">
                  Same board, both sides. Cards move, everyone sees it.
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="copilot" className="tl-section">
          <div className="tl-shell tl-row">
            <Reveal className="tl-row-copy">
              <p className="tl-eyebrow">THE COPILOT</p>
              <h2 className="tl-h2">@AI drafts it. You send it.</h2>
              <p className="tl-body">
                Mention <span className="tl-code">@AI</span> in any thread and get a
                reply in your voice — client-facing answers, scope clarifications,
                status updates. It’s a draft, not a broadcast: you review, edit, send.
              </p>
            </Reveal>
            <Reveal className="tl-row-art" delay={120}>
              <div className="tl-card tl-ai">
                <div className="tl-ai-head">
                  <span className="tl-ai-glyph">@</span>
                  <span>
                    <div className="tl-ai-title">BrandForge AI</div>
                    <div className="tl-ai-status">drafting in your voice…</div>
                  </span>
                </div>
                <div className="tl-ai-draft">
                  “Yes — Thursday EOD, with the form wired in. Scope locked, and you’ll
                  see each card move on the board.”
                </div>
                <div className="tl-ai-actions">
                  <span className="tl-btn tl-btn-small tl-btn-primary">Review</span>
                  <span className="tl-btn tl-btn-small tl-btn-soft">Send</span>
                  <span className="tl-ai-note">Drafted by @AI · you approve it</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="how" className="tl-section tl-section-alt">
          <div className="tl-shell tl-steps">
            <Reveal className="tl-steps-head">
              <p className="tl-eyebrow">HOW A THREAD STARTS</p>
              <h2 className="tl-h2">Three messages to first payout.</h2>
            </Reveal>
            <div className="tl-steps-grid">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 100}>
                  <div className="tl-step">
                    <span className="tl-step-n">{s.n}</span>
                    <h3 className="tl-step-title">{s.title}</h3>
                    <p className="tl-step-body">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="tl-cta">
          <div className="tl-shell tl-cta-inner">
            <Reveal>
              <h2 className="tl-h2 tl-cta-h">
                Your next client project starts with one message.
              </h2>
              <p className="tl-cta-sub">
                Sign in, start a thread, and see escrow, milestones and the AI copilot
                working in one place.
              </p>
              <div className="tl-hero-actions tl-cta-actions">
                <a className="tl-btn tl-btn-primary tl-btn-on-dark" href="/signin">
                  Start a thread
                </a>
                <a className="tl-btn tl-btn-ghost tl-btn-ghost-dark" href="#money">
                  How it works
                </a>
              </div>
              <p className="tl-hero-note tl-cta-note">Free to start · no client install</p>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="tl-footer">
        <div className="tl-shell tl-footer-inner">
          <div className="tl-foot-brand">
            <span className="tl-mark" aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
                <rect x="3" y="3" width="11" height="11" rx="3" fill="#2563EB" />
                <rect x="10" y="10" width="11" height="11" rx="3" fill="#0A1D2E" />
              </svg>
            </span>
            <span className="tl-foot-word">BrandForge</span>
            <span className="tl-foot-copy">© 2026 BrandForge</span>
          </div>
          <nav className="tl-foot-links" aria-label="Legal">
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/cookies">Cookies</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
