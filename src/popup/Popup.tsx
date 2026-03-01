import { DefaultUserIcon, GitIcon, SettingsIcon } from '../icon';

export interface PopupProps {
	githubUserFullname: string | null | undefined;
	githubUsername: string | undefined;
	githubUserUrl: string | undefined;
	githubUserAvatarUrl: string | undefined;
	githubRepoFullname: string | undefined;
	githubRepoUrl: string | undefined;
}

export function Popup({
	githubUserFullname,
	githubUsername,
	githubUserUrl,
	githubUserAvatarUrl,
	githubRepoFullname,
	githubRepoUrl,
}: PopupProps) {
	const handleUsernameClick = () => {
		if (githubUsername) {
			chrome.tabs.create({ url: githubUserUrl });
			window.close();
		} else {
			chrome.tabs.create({ url: '/src/options/options.html?focus=githubPat' });
			window.close();
		}
	};

	const handleGithubRepoClick = () => {
		if (githubRepoUrl) {
			chrome.tabs.create({ url: githubRepoUrl });
			window.close();
		} else {
			chrome.tabs.create({ url: '/src/options/options.html?focus=githubRepoFullname' });
			window.close();
		}
	};

	return (
		<div class='grid grid-cols-1 gap-y-6 select-none'>
			<div class='flex flex-row items-center justify-between px-4 pt-4'>
				<h1 class='font-mono text-lg font-extrabold'>Leet2Hub</h1>
				<div class='flex flex-row items-center gap-x-2'>
					<button
						type='button'
						title='Open Leet2Hub Settings'
						onClick={() => chrome.tabs.create({ url: '/src/options/options.html' }).finally(() => window.close())}
						class='hover:cursor-pointer'
					>
						<SettingsIcon className='size-6' />
					</button>
				</div>
			</div>

			<div class='flex flex-col gap-y-4 px-2 py-2'>
				<div class='flex flex-row items-center gap-x-2 px-2 py-2 bg-slate-900 rounded-full shadow-md'>
					{githubUserAvatarUrl ? (
						<img src={githubUserAvatarUrl} alt='' class='h-10 w-10 rounded-full' />
					) : (
						<DefaultUserIcon className='h-10 w-10' />
					)}
					<div class='flex flex-col justify-start'>
						<button
							type='button'
							title={githubUsername ? githubUserUrl : 'Login'}
							onClick={handleUsernameClick}
							class='text-base text-start hover:cursor-pointer hover:underline'
						>
							{githubUsername ? githubUsername : 'Login'}
						</button>
						{githubUserFullname && <h1 class='text-gray-400 text-xs'>{githubUserFullname}</h1>}
					</div>
				</div>

				{githubUsername && (
					<div class='flex flex-row items-center gap-x-2 px-4 py-3 bg-slate-900 rounded-full shadow-md'>
						<GitIcon className='w-6 h-6 fill-white' />
						<button
							type='button'
							title={githubRepoUrl ? githubRepoUrl : 'Settings'}
							onClick={handleGithubRepoClick}
							class='text-base text-start hover:cursor-pointer hover:underline'
						>
							{githubRepoFullname ? githubRepoFullname : 'Add a GitHub repository'}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
