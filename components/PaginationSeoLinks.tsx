import {
  buildCanonicalPaginationQueryString,
  buildPaginationQueryString,
  findPrimaryPaginatedCollection,
} from '@/lib/pagination-url-utils';
import { buildAbsolutePageUrl } from '@/lib/url-utils';
import type { Layer } from '@/types';

interface PaginationSeoLinksProps {
  /** Resolved page layers, carrying the collections' pagination meta. */
  layers: Layer[];
  /** Public path of the current request (`/news`). */
  basePath: string;
  /** Current query string. Only real pagination params are carried over. */
  queryString?: string;
  /** Absolute site base URL. Links stay path-relative when unavailable. */
  baseUrl?: string | null;
}

/**
 * Emits `<link rel="prev">` / `<link rel="next">` for a paginated collection so
 * crawlers can walk the sequence instead of only seeing page 1. React hoists
 * the tags into the document head.
 */
export default function PaginationSeoLinks({
  layers,
  basePath,
  queryString,
  baseUrl,
}: PaginationSeoLinksProps) {
  const primary = findPrimaryPaginatedCollection(layers);

  if (!primary) return null;

  const { collectionLayerId, meta } = primary;
  const canonicalQuery = buildCanonicalPaginationQueryString(layers, queryString || '');

  const urlForPage = (page: number): string => {
    const query = buildPaginationQueryString({ queryString: canonicalQuery, collectionLayerId, page });
    const path = baseUrl ? buildAbsolutePageUrl(baseUrl, basePath) : basePath;
    return query ? `${path}?${query}` : path;
  };

  return (
    <>
      {meta.currentPage > 1 && (
        <link
          rel="prev"
          href={urlForPage(meta.currentPage - 1)}
        />
      )}
      {meta.currentPage < meta.totalPages && (
        <link
          rel="next"
          href={urlForPage(meta.currentPage + 1)}
        />
      )}
    </>
  );
}
