import type { SUPPORTED_LANG_EXTENSIONS } from './utils';

export interface SvgIconProps {
	className: string;
}

export interface LocalStorage {
	githubPat?: string;

	githubUser?: ApiGithubUser;

	githubRepo?: ApiGitHubRepository;

	submissionId?: string;
	submission?: {
		lang: SuportedLang;
		problemName: string;
		typedCode: string;
	};
}

export interface ApiGithubUser {
	login: string;
	id: number;
	user_view_type?: string;
	node_id: string;
	avatar_url: string;
	gravatar_id: string | null;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	site_admin: boolean;
	name: string | null;
	company: string | null;
	blog: string | null;
	location: string | null;
	email: string | null;
	notification_email?: string | null;
	hireable: boolean | null;
	bio: string | null;
	twitter_username?: string | null;
	public_repos: number;
	public_gists: number;
	followers: number;
	following: number;
	created_at: string;
	updated_at: string;
	private_gists: number;
	total_private_repos: number;
	owned_private_repos: number;
	disk_usage: number;
	collaborators: number;
	two_factor_authentication: boolean;
}

export type ApiGitHubSearchResponse = {
	total_count: number;
	incomplete_results: boolean;
	items: ApiGitHubRepository[];
};

export type ApiGitHubRepository = {
	id: number;
	node_id: string;
	name: string;
	full_name: string;
	owner: ApiGitHubRepoOwner;

	private: boolean;
	html_url: string;
	description: string | null;
	fork: boolean;
	url: string;

	created_at: string;
	updated_at: string;
	pushed_at: string;

	homepage: string | null;
	size: number;
	stargazers_count: number;
	watchers_count: number;
	language: string | null;

	forks_count: number;
	open_issues_count: number;

	master_branch?: string;
	default_branch: string;
	score: number;

	archive_url: string;
	assignees_url: string;
	blobs_url: string;
	branches_url: string;
	collaborators_url: string;
	comments_url: string;
	commits_url: string;
	compare_url: string;
	contents_url: string;
	contributors_url: string;
	deployments_url: string;
	downloads_url: string;
	events_url: string;
	forks_url: string;
	git_commits_url: string;
	git_refs_url: string;
	git_tags_url: string;
	git_url: string;
	issue_comment_url: string;
	issue_events_url: string;
	issues_url: string;
	keys_url: string;
	labels_url: string;
	languages_url: string;
	merges_url: string;
	milestones_url: string;
	notifications_url: string;
	pulls_url: string;
	releases_url: string;
	ssh_url: string;
	stargazers_url: string;
	statuses_url: string;
	subscribers_url: string;
	subscription_url: string;
	tags_url: string;
	teams_url: string;
	trees_url: string;

	clone_url: string;
	mirror_url?: string;
	hooks_url: string;
	svn_url: string;

	forks: number;
	open_issues: number;
	watchers: number;

	has_issues: boolean;
	has_projects: boolean;
	has_pages: boolean;
	has_wiki: boolean;
	has_downloads: boolean;

	archived: boolean;
	disabled: boolean;
	visibility: string;
};

export type ApiGitHubRepoOwner = {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	gravatar_id: string | null;
	url: string;

	received_events_url: string;
	type: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;

	site_admin: boolean;
};

export interface ApiGitHubContent {
	type: 'file';
	encoding: 'base64' | string;
	size: number;
	name: string;
	path: string;
	content: string; // base64 encoded content
	sha: string;
	url: string;
	git_url: string;
	html_url: string;
	download_url: string | null;
	_links: {
		git: string;
		self: string;
		html: string;
	};
}

export interface LeetCodeSubmitRequestBody {
	lang: SuportedLang;
	question_id: number;
	typed_code: string;
}

export interface BodyParams {
	message: string;
	content: string;
	sha?: string;
}

export type SuportedLang = keyof typeof SUPPORTED_LANG_EXTENSIONS;
