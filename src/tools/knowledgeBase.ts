import { KB_ARTICLES } from "../data/mockDb.js";
import { SearchKbInput, SearchKbOutput, GetArticleInput, toolError } from "../schemas/toolSchemas.js";
import type { KbArticle } from "../schemas/toolSchemas.js";

// Searches the knowledge base by keyword matching against title, summary and keywords.
// Returns up to `limit` articles (default 3, max 5). Results are unranked.
// Does NOT return full step-by-step content — use get_article for that.
// Does NOT cover security incident response or finance system procedures.
export function search_kb(rawInput: unknown): ReturnType<typeof SearchKbOutput.parse> | ReturnType<typeof toolError> {
  const parsed = SearchKbInput.safeParse(rawInput);
  if (!parsed.success) return toolError(`Invalid input: ${parsed.error.message}`, "INVALID_INPUT");

  const q = parsed.data.query.toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);

  const scored = KB_ARTICLES.map((article) => {
    const haystack = [article.title, article.summary, ...article.keywords].join(" ").toLowerCase();
    const hits = terms.filter((t) => haystack.includes(t)).length;
    return { article, hits };
  });

  const articles = scored
    .filter((s) => s.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, parsed.data.limit)
    .map((s) => s.article);

  return { query: parsed.data.query, articles };
}

// Returns a single KB article by its article_id, including full resolution steps.
// Does NOT search — use search_kb to find relevant article_ids first.
export function get_article(rawInput: unknown): KbArticle | ReturnType<typeof toolError> {
  const parsed = GetArticleInput.safeParse(rawInput);
  if (!parsed.success) return toolError(`Invalid input: ${parsed.error.message}`, "INVALID_INPUT");

  const article = KB_ARTICLES.find((a) => a.article_id === parsed.data.article_id);
  if (!article) return toolError(`Article not found: ${parsed.data.article_id}`, "ARTICLE_NOT_FOUND");
  return article;
}
