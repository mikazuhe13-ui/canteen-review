const fs = require('fs')
const path = require('path')

const outDir = path.join(__dirname, '..', 'images', 'tabbar')
const icons = {
  feed: {
    inactive: [
      '<path d="M21 19.5h54a9 9 0 0 1 9 9v28a9 9 0 0 1-9 9H45L28.5 77.5v-12h-7.5a9 9 0 0 1-9-9v-28a9 9 0 0 1 9-9Z"/>',
      '<path d="M30 36h36M30 49h23"/>'
    ],
    active: [
      '<path class="soft" d="M21 19.5h54a9 9 0 0 1 9 9v28a9 9 0 0 1-9 9H45L28.5 77.5v-12h-7.5a9 9 0 0 1-9-9v-28a9 9 0 0 1 9-9Z"/>',
      '<path d="M21 19.5h54a9 9 0 0 1 9 9v28a9 9 0 0 1-9 9H45L28.5 77.5v-12h-7.5a9 9 0 0 1-9-9v-28a9 9 0 0 1 9-9Z"/>',
      '<path d="M30 36h36M30 49h23"/>',
      '<circle class="accent" cx="73" cy="24" r="6"/>'
    ]
  },
  ranking: {
    inactive: [
      '<path d="M22 76h52"/>',
      '<path d="M28 76V50a6 6 0 0 1 6-6h5a6 6 0 0 1 6 6v26"/>',
      '<path d="M51 76V31a6 6 0 0 1 6-6h5a6 6 0 0 1 6 6v45"/>',
      '<path d="M18 76V60a6 6 0 0 1 6-6h4"/>'
    ],
    active: [
      '<path class="soft" d="M51 76V31a6 6 0 0 1 6-6h5a6 6 0 0 1 6 6v45H51Z"/>',
      '<path d="M22 76h52"/>',
      '<path d="M28 76V50a6 6 0 0 1 6-6h5a6 6 0 0 1 6 6v26"/>',
      '<path d="M51 76V31a6 6 0 0 1 6-6h5a6 6 0 0 1 6 6v45"/>',
      '<path d="M18 76V60a6 6 0 0 1 6-6h4"/>',
      '<circle class="accent" cx="60" cy="20" r="5"/>'
    ]
  },
  canteen: {
    inactive: [
      '<path d="M22 47h52"/>',
      '<path d="M28 47h40v8a20 20 0 0 1-40 0v-8Z"/>',
      '<path d="M32 31v7M48 25v13M64 31v7"/>',
      '<path d="M35 74h26"/>'
    ],
    active: [
      '<path class="soft" d="M28 47h40v8a20 20 0 0 1-40 0v-8Z"/>',
      '<path d="M22 47h52"/>',
      '<path d="M28 47h40v8a20 20 0 0 1-40 0v-8Z"/>',
      '<path d="M32 31v7M48 25v13M64 31v7"/>',
      '<path d="M35 74h26"/>',
      '<circle class="accent" cx="59" cy="55" r="5"/>'
    ]
  },
  profile: {
    inactive: [
      '<circle cx="48" cy="34" r="14"/>',
      '<path d="M23 76c3.5-15 13-23 25-23s21.5 8 25 23"/>'
    ],
    active: [
      '<circle class="soft" cx="48" cy="34" r="14"/>',
      '<circle cx="48" cy="34" r="14"/>',
      '<path d="M23 76c3.5-15 13-23 25-23s21.5 8 25 23"/>',
      '<circle class="accent" cx="61" cy="28" r="5"/>'
    ]
  },
  admin: {
    inactive: [
      '<path d="M48 14 73 25v20c0 17-10.5 27.5-25 37-14.5-9.5-25-20-25-37V25l25-11Z"/>',
      '<path d="M36 47.5 45 56l16-19"/>'
    ],
    active: [
      '<path class="soft" d="M48 14 73 25v20c0 17-10.5 27.5-25 37-14.5-9.5-25-20-25-37V25l25-11Z"/>',
      '<path d="M48 14 73 25v20c0 17-10.5 27.5-25 37-14.5-9.5-25-20-25-37V25l25-11Z"/>',
      '<path d="M36 47.5 45 56l16-19"/>',
      '<circle class="accent" cx="66" cy="25" r="5"/>'
    ]
  }
}

function svg(paths, active) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none">
  <style>
    path,circle{stroke:${active ? '#1677FF' : '#8C9199'};stroke-width:5.5;stroke-linecap:round;stroke-linejoin:round}
    .soft{fill:${active ? '#EAF3FF' : 'transparent'};stroke:none}
    .accent{fill:#FFB020;stroke:#FFB020}
  </style>
  ${paths.join('\n  ')}
</svg>
`
}

fs.mkdirSync(outDir, { recursive: true })
for (const [name, states] of Object.entries(icons)) {
  fs.writeFileSync(path.join(outDir, `${name}.svg`), svg(states.inactive, false))
  fs.writeFileSync(path.join(outDir, `${name}-active.svg`), svg(states.active, true))
}

console.log(`Generated ${Object.keys(icons).length * 2} premium SVG icons in ${outDir}`)
