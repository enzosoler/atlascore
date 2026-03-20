# Atlas Core Design System (v1.0)

## 🎨 1. Color System
High-performance, clinical, and precise.

### Brand Colors
| Name | HEX | RGB | HSL | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Clinical Cyan** | `#00FFFF` | `0, 255, 255` | `180, 100%, 50%` | Primary Brand, Highlights |
| **Deep Obsidian** | `#05070A` | `5, 7, 10` | `216, 33%, 3%` | Primary Background (Dark) |
| **Pure White** | `#FFFFFF` | `255, 255, 255` | `0, 0%, 100%` | Primary Text, Secondary Logo |

### Semantic Colors
| Name | HEX | Usage |
| :--- | :--- | :--- |
| **Success** | `#10B981` | Positive progress, completed protocols |
| **Warning** | `#F59E0B` | Attention needed, threshold alerts |
| **Error** | `#EF4444` | Critical issues, failed metrics |

### Tailwind CSS Configuration
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        atlas: {
          cyan: '#00FFFF',
          obsidian: '#05070A',
          white: '#FFFFFF',
        },
        semantic: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        }
      }
    }
  }
}
```

## 🔤 2. Typography
Focused on clarity and technical precision.

- **Primary Font**: Inter (or SF Pro / San Francisco)
- **Secondary Font**: JetBrains Mono (for data/metrics)

### Type Scale
- **Heading 1**: 32px / 2rem (Bold, -0.02em tracking)
- **Heading 2**: 24px / 1.5rem (Semibold, -0.01em tracking)
- **Body**: 16px / 1rem (Regular)
- **Caption**: 12px / 0.75rem (Medium, Uppercase for labels)

## 🧩 3. UI Foundations
- **Border Radius**: `4px` (Sharp/Precise) or `8px` (Standard). Avoid large rounded corners.
- **Shadows**: Low elevation. Use `0 2px 4px rgba(0,0,0,0.1)`.
- **Buttons**: Solid Obsidian with Cyan text or Solid Cyan with Obsidian text.
- **Cards**: Obsidian background with 1px White border at 10% opacity.

## 📐 4. Logo Rules
- **Minimum Size**: 24px (Logomark), 120px (Primary Logo).
- **Clear Space**: Equal to the height of the "a" in the wordmark.
- **Don'ts**: Do not rotate, do not use gradients, do not change the aspect ratio.
