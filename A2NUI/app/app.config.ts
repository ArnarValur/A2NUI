export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'slate'
    },
    footer: {
      slots: {
        root: 'border-t border-default',
        left: 'text-sm text-muted'
      }
    }
  },
  seo: {
    siteName: 'A2NUI — Component Library'
  },
  header: {
    title: 'A2NUI',
    to: '/',
    search: true,
    colorMode: true,
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/ArnarValur/A2NUI',
      'target': '_blank',
      'aria-label': 'GitHub'
    }]
  },
  footer: {
    credits: `A2NUI — Merkurial-Studio • © ${new Date().getFullYear()}`,
    creditsLink: 'https://merkurial-studio.com',
    colorMode: false,
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/ArnarValur/A2NUI',
      'target': '_blank',
      'aria-label': 'A2NUI on GitHub'
    }]
  },
  toc: {
    title: 'On this page',
    bottom: {
      title: 'Resources',
      links: [{
        icon: 'i-lucide-flask-conical',
        label: 'Try in Playground',
        to: '/playground'
      }, {
        icon: 'i-lucide-book-open',
        label: 'A2UI Protocol Spec',
        to: '/getting-started'
      }]
    }
  }
})
