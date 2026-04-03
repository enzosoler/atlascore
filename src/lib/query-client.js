import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';

/** Derive a user-friendly message from a query/mutation error. */
function getErrorMessage(error) {
	if (error?.message === 'Failed to fetch') return 'Network error — check your connection and try again.';
	return error?.message || 'Something went wrong. Please try again.';
}

export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			staleTime: 5 * 60 * 1000,
			gcTime: 10 * 60 * 1000,
		},
	},
	queryCache: new QueryCache({
		onError: (err, query) => {
			// Allow individual queries to opt out via meta.suppressGlobalError
			if (query?.meta?.suppressGlobalError) return;
			console.error('[Query failed]', err);
			toast.error(getErrorMessage(err));
		},
	}),
	mutationCache: new MutationCache({
		onError: (err, _variables, _context, mutation) => {
			// Allow individual mutations to opt out via meta.suppressGlobalError
			if (mutation?.meta?.suppressGlobalError) return;
			console.error('[Mutation failed]', err);
			toast.error(getErrorMessage(err));
		},
	}),
});

// Expose globally for auth logout cleanup
if (typeof window !== 'undefined') {
	window.__queryClient = queryClientInstance;
}