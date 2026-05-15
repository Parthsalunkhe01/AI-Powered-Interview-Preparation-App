/**
 * Premium Technical Whitepaper PDF Template.
 * A high-fidelity replica of the Digital Interview Experience.
 */
export const generatePdfHtml = (data) => {
    const { summary, questions, finalAdvice } = data;

    const format = (text) => text ? text.replace(/\n/g, '<br>') : '';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@500&display=swap');
            
            body {
                font-family: 'Inter', sans-serif;
                color: #1e293b;
                line-height: 1.6;
                margin: 0;
                padding: 40px;
                background: white;
            }

            .container { max-width: 850px; margin: auto; }

            /* --- Brand Header --- */
            .brand-header {
                border-bottom: 3px solid #0f172a;
                padding-bottom: 20px;
                margin-bottom: 40px;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
            }

            .brand-header h1 {
                font-size: 28px;
                font-weight: 800;
                margin: 0;
                letter-spacing: -0.04em;
                color: #0f172a;
            }

            .brand-meta {
                font-size: 11px;
                font-weight: 800;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.1em;
            }

            /* --- Performance Summary --- */
            .summary-banner {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 20px;
                padding: 30px;
                margin-bottom: 60px;
            }

            .badge {
                display: inline-block;
                padding: 6px 14px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 800;
                background: #0f172a;
                color: white;
                text-transform: uppercase;
                margin-bottom: 16px;
            }

            .summary-grid {
                display: grid;
                grid-template-cols: 1.5fr 1fr;
                gap: 40px;
            }

            .main-focus-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 4px;}
            .main-focus-val { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }

            /* --- Question Block --- */
            .question-section {
                margin-bottom: 80px;
                page-break-inside: avoid;
            }

            .q-title-row {
                background: #0f172a;
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                font-size: 18px;
                font-weight: 800;
                margin-bottom: 30px;
            }

            .section-label {
                font-size: 11px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: #6366f1;
                margin-bottom: 12px;
                display: block;
            }

            /* --- Blocks --- */
            .ideal-answer-box {
                background: #fdf2f8;
                border-left: 4px solid #db2777;
                padding: 24px;
                border-radius: 0 12px 12px 0;
                margin-bottom: 30px;
                font-style: italic;
                font-weight: 500;
                color: #831843;
            }

            .core-breakdown-box {
                background: #f8fafc;
                border: 1px solid #f1f5f9;
                padding: 24px;
                border-radius: 16px;
                margin-bottom: 30px;
                font-size: 14px;
            }

            .insight-pill {
                display: inline-block;
                background: #eef2ff;
                color: #4338ca;
                padding: 4px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 700;
                margin-right: 8px;
                margin-bottom: 8px;
                border: 1px solid #e0e7ff;
            }

            .production-box {
                background: #f0fdf4;
                border: 1px solid #dcfce7;
                padding: 20px;
                border-radius: 12px;
                margin-top: 30px;
            }

            .production-box h5 {
                margin: 0 0 8px 0;
                font-size: 12px;
                color: #166534;
                text-transform: uppercase;
            }

            .tech-specs {
                font-family: 'JetBrains Mono', monospace;
                font-size: 12px;
                background: #fafafa;
                padding: 16px;
                border-radius: 12px;
                border: 1px solid #eee;
            }

            .follow-ups {
                margin-top: 24px;
                padding: 16px;
                background: #fffbeb;
                border-radius: 12px;
                border: 1px solid #fef3c7;
                font-size: 13px;
                font-weight: 600;
                color: #92400e;
            }

            /* --- Resources --- */
            .resource-grid {
                display: grid;
                grid-template-cols: 1fr 1fr;
                gap: 24px;
                margin-top: 30px;
                border-top: 1px solid #f1f5f9;
                padding-top: 24px;
            }

            .res-card { font-size: 12px; }
            .res-card a { color: #4f46e5; text-decoration: none; font-weight: 700; }

            @media print {
                body { padding: 0; }
                .container { max-width: 100%; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header class="brand-header">
                <h1>Interview Performance Guide</h1>
                <div class="brand-meta">${summary.role} • ${summary.experience} • ${summary.date}</div>
            </header>

            <section class="summary-banner">
                <div class="badge">${summary.status} — ${summary.score}% Readiness</div>
                <div class="summary-grid">
                    <div>
                        <span class="main-focus-label">Primary Mastery Target</span>
                        <h2 class="main-focus-val">${summary.mainFocus}</h2>
                    </div>
                    <div style="font-size: 13px; color: #64748b; border-left: 1px solid #e2e8f0; padding-left: 30px;">
                        <em>"${summary.oneLiner}"</em>
                    </div>
                </div>
            </section>

            <section>
                ${questions.map(q => `
                    <div class="question-section">
                        <div class="q-title-row">Q${q.number}. ${q.question}</div>

                        <div class="ideal-answer-box">
                            <span class="section-label" style="color: #be185d;">Polished Interview Response</span>
                            "${q.idealAnswer}"
                        </div>

                        <div class="core-breakdown-box">
                            <span class="section-label">Architectural Breakdown</span>
                            <div style="white-space: pre-wrap;">${format(q.coreBreakdown)}</div>
                        </div>

                        <div style="display: grid; grid-template-cols: 1fr 1.5fr; gap: 30px;">
                            <div class="tech-specs">
                                <span class="section-label" style="color: #475569;">Suggested Tech Stack</span>
                                <div style="white-space: pre-wrap;">${format(q.suggestedStack)}</div>
                            </div>
                            <div>
                                <span class="section-label">Key Technical Concepts</span>
                                <div style="margin-top: 8px;">
                                    ${(q.keyInsights || '').split('\n').map(i => `<span class="insight-pill">${i.replace(/•|•\s/g, '')}</span>`).join('')}
                                </div>
                            </div>
                        </div>

                        <div class="production-box">
                            <h5>🚀 Production Insights (Real World Case Study)</h5>
                            <div style="font-size: 14px; color: #166534; font-weight: 500;">${q.productionInsight}</div>
                        </div>

                        <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 30px; margin-top: 30px;">
                            <div style="background: #fff1f2; padding: 20px; border-radius: 12px; border: 1px solid #ffe4e6;">
                                <span class="section-label" style="color: #e11d48;">Critical Mistakes to Avoid</span>
                                <div style="font-size: 13px; color: #9f1239; white-space: pre-wrap;">${format(q.mistakes)}</div>
                            </div>
                            <div class="follow-ups">
                                <span class="section-label" style="color: #b45309;">Anticipated Follow-up Questions</span>
                                <div style="white-space: pre-wrap;">${format(q.followUps)}</div>
                            </div>
                        </div>

                        <div class="resource-grid">
                            <div>
                                <span class="section-label" style="color: #475569;">🎥 Video Tutorials</span>
                                <div class="res-card">${q.videos.map(v => `• <a href="${v.url}">${v.title}</a><br>`).join('')}</div>
                            </div>
                            <div>
                                <span class="section-label" style="color: #475569;">📘 Reading Materials</span>
                                <div class="res-card">${q.articles.map(a => `• <a href="${a.url}">${a.title}</a><br>`).join('')}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </section>
        </div>
    </body>
    </html>
    `;
};
