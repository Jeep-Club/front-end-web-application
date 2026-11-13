import config from './playwright.config';
import { readLocalUrl } from './config/local-urls.cjs';

// App-only feed tests need no Storybook. Launch Next directly to avoid nested
// npm processes during Windows teardown; the regular config still tests stories.
const app = readLocalUrl('PLAYWRIGHT_APP_URL');
const server = Array.isArray(config.webServer) ? config.webServer[0] : config.webServer;
const feedConfig = {
    ...config,
    reporter: [['list']] as [['list']],
    webServer: process.env.JEEP_TEST_EXTERNAL_SERVER === '1' ? undefined : { ...server!, command: `node node_modules/next/dist/bin/next dev --hostname ${app.hostname} --port ${app.port}` },
    projects: config.projects?.filter(p => p.name === 'chromium-desktop' || p.name === 'chromium-mobile' || p.name === 'a11y-chromium-desktop').map(p => ({ ...p, use: { ...p.use, channel: 'chrome' } })),
};
export default feedConfig;
