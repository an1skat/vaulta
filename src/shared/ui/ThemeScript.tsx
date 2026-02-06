const themeScript = `(function () {
  try {
    var stored = localStorage.getItem('vaulta-theme');
    var theme = stored === 'light' || stored === 'dark' ? stored : null;
    if (!theme) {
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();`

export default function ThemeScript() {
	return <script dangerouslySetInnerHTML={{ __html: themeScript }} />
}
