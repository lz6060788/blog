import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', 'class'],
  theme: {
  	extend: {
  		colors: {
  			zinc: {
  				'50': '#fafafa',
  				'100': '#f4f4f5',
  				'200': '#e4e4e7',
  				'300': '#d4d4d8',
  				'400': '#a1a1aa',
  				'500': '#71717a',
  				'600': '#52525b',
  				'700': '#3f3f46',
  				'800': '#27272a',
  				'900': '#18181b',
  				'950': '#09090b'
  			},
  			theme: {
  				bg: {
  					canvas: 'var(--bg-canvas)',
  					surface: 'var(--bg-surface)',
  					'surface-alt': 'var(--bg-surface-alt)',
  					muted: 'var(--bg-muted)',
  					subtle: 'var(--bg-subtle)',
  					overlay: 'var(--bg-overlay)'
  				},
  				text: {
  					canvas: 'var(--text-canvas)',
  					surface: 'var(--text-surface)',
  					primary: 'var(--text-primary)',
  					secondary: 'var(--text-secondary)',
  					tertiary: 'var(--text-tertiary)',
  					muted: 'var(--text-muted)',
  					disabled: 'var(--text-disabled)',
  					reversed: 'var(--text-reversed)'
  				},
  				border: {
  					DEFAULT: 'var(--border-default)',
  					muted: 'var(--border-muted)',
  					subtle: 'var(--border-subtle)',
  					strong: 'var(--border-strong)'
  				},
  				accent: {
  					primary: 'var(--accent-primary)',
  					secondary: 'var(--accent-secondary)',
  					tertiary: 'var(--accent-tertiary)',
  					bg: 'var(--accent-bg)',
  					'bg-subtle': 'var(--accent-bg-subtle)',
  					fg: 'var(--accent-fg)'
  				},
  				success: {
  					primary: 'var(--success-primary)',
  					bg: 'var(--success-bg)',
  					text: 'var(--success-text)'
  				},
  				warning: {
  					primary: 'var(--warning-primary)',
  					bg: 'var(--warning-bg)',
  					text: 'var(--warning-text)'
  				},
  				error: {
  					primary: 'var(--error-primary)',
  					bg: 'var(--error-bg)',
  					text: 'var(--error-text)'
  				},
  				info: {
  					primary: 'var(--info-primary)',
  					bg: 'var(--info-bg)',
  					text: 'var(--info-text)'
  				},
  				// === 组件颜色系统 === */
  				// Button (btn)
  				btn: {
  					// Default 变体
  					'default-bg': 'var(--btn-default-bg)',
  					'default-fg': 'var(--btn-default-fg)',
  					'default-bg-hover': 'var(--btn-default-bg-hover)',
  					'default-fg-hover': 'var(--btn-default-fg-hover)',
  					// Destructive 变体
  					'destructive-bg': 'var(--btn-destructive-bg)',
  					'destructive-fg': 'var(--btn-destructive-fg)',
  					'destructive-bg-hover': 'var(--btn-destructive-bg-hover)',
  					// Outline 变体
  					'outline-bg': 'var(--btn-outline-bg)',
  					'outline-fg': 'var(--btn-outline-fg)',
  					'outline-border': 'var(--btn-outline-border)',
  					'outline-bg-hover': 'var(--btn-outline-bg-hover)',
  					'outline-fg-hover': 'var(--btn-outline-fg-hover)',
  					// Secondary 变体
  					'secondary-bg': 'var(--btn-secondary-bg)',
  					'secondary-fg': 'var(--btn-secondary-fg)',
  					'secondary-bg-hover': 'var(--btn-secondary-bg-hover)',
  					// Ghost 变体
  					'ghost-bg': 'var(--btn-ghost-bg)',
  					'ghost-fg': 'var(--btn-ghost-fg)',
  					'ghost-bg-hover': 'var(--btn-ghost-bg-hover)',
  					'ghost-fg-hover': 'var(--btn-ghost-fg-hover)',
  					// Link 变体
  					'link-bg': 'var(--btn-link-bg)',
  					'link-fg': 'var(--btn-link-fg)'
  				},
  				// Switch (swt)
  				swt: {
  					'bg-checked': 'var(--swt-bg-checked)',
  					'bg-checked-hover': 'var(--swt-bg-checked-hover)',
  					'bg-unchecked': 'var(--swt-bg-unchecked)',
  					'border-unchecked': 'var(--swt-border-unchecked)',
  					'thumb-bg': 'var(--swt-thumb-bg)',
  					'ring-color': 'var(--swt-ring-color)'
  				},
  				// Dialog (dlg)
  				dlg: {
  					'overlay-bg': 'var(--dlg-overlay-bg)',
  					'content-bg': 'var(--dlg-content-bg)',
  					'content-border': 'var(--dlg-content-border)',
  					'close-bg-hover': 'var(--dlg-close-bg-hover)',
  					'close-fg-hover': 'var(--dlg-close-fg-hover)',
  					'title-fg': 'var(--dlg-title-fg)',
  					'desc-fg': 'var(--dlg-desc-fg)',
  					'ring-color': 'var(--dlg-ring-color)'
  				},
  				// Avatar (avt)
  				avt: {
  					'fallback-bg': 'var(--avt-fallback-bg)',
  					'fallback-fg': 'var(--avt-fallback-fg)'
  				},
  				// DropdownMenu (ddm)
  				ddm: {
  					'content-bg': 'var(--ddm-content-bg)',
  					'content-border': 'var(--ddm-content-border)',
  					'content-fg': 'var(--ddm-content-fg)',
  					'item-bg-hover': 'var(--ddm-item-bg-hover)',
  					'item-fg-hover': 'var(--ddm-item-fg-hover)',
  					'separator-bg': 'var(--ddm-separator-bg)',
  					'label-fg': 'var(--ddm-label-fg)'
  				},
  				// Table (tbl)
  				tbl: {
  					'footer-bg': 'var(--tbl-footer-bg)',
  					'row-bg-hover': 'var(--tbl-row-bg-hover)',
  					'row-bg-selected': 'var(--tbl-row-bg-selected)',
  					'head-fg': 'var(--tbl-head-fg)',
  					'caption-fg': 'var(--tbl-caption-fg)'
  				},
  				// Sheet (sht)
  				sht: {
  					'overlay-bg': 'var(--sht-overlay-bg)',
  					'content-bg': 'var(--sht-content-bg)',
  					'content-border': 'var(--sht-content-border)',
  					'close-bg-hover': 'var(--sht-close-bg-hover)',
  					'title-fg': 'var(--sht-title-fg)',
  					'desc-fg': 'var(--sht-desc-fg)'
  				},
  				// 保留旧变量以兼容
  				input: {
  					bg: 'var(--input-bg)',
  					border: 'var(--input-border)',
  					'border-focus': 'var(--input-border-focus)',
  					text: 'var(--input-text)',
  					placeholder: 'var(--input-placeholder)'
  				},
  				card: {
  					bg: 'var(--card-bg)',
  					border: 'var(--card-border)',
  					shadow: 'var(--card-shadow)'
  				},
  				nav: {
  					bg: 'var(--nav-bg)',
  					border: 'var(--nav-border)'
  				}
  			}
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-outfit)',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'var(--font-jetbrains-mono)',
  				'monospace'
  			]
  		},
  		letterSpacing: {
  			tighter: '-0.04em'
  		},
  		boxShadow: {
  			card: 'var(--card-shadow)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
