# Tailwind Quick Reference for Connectify2 Dark Theme

## Common Color Classes

### Backgrounds
```
bg-dark-primary      → #000000 (pure black)
bg-dark-secondary    → #0a0a0a (near black)
bg-dark-tertiary     → #1a1a1a (dark gray)
bg-brand-blue        → #2196f3 (blue)
```

### Text Colors
```
text-dark-text-primary     → #ffffff (white)
text-dark-text-secondary   → #a8a8a8 (light gray)
text-dark-text-tertiary    → #737373 (medium gray)
text-brand-blue            → #2196f3 (blue)
```

### Borders
```
border-dark-border   → #262626 (dark gray)
border-brand-blue    → #2196f3 (blue)
```

## Common Patterns

### Container
```jsx
<div className="bg-dark-tertiary border border-dark-border rounded-lg p-4">
```

### Input Field
```jsx
<input className="w-full h-10 px-3 rounded-md bg-dark-secondary border border-dark-border 
  text-dark-text-primary placeholder-dark-text-tertiary 
  focus:border-brand-blue focus:outline-none transition-colors" />
```

### Button Primary
```jsx
<button className="px-6 py-2 rounded-md bg-brand-blue hover:bg-brand-blue-hover 
  text-white font-semibold transition-colors">
```

### Button Secondary
```jsx
<button className="px-6 py-2 rounded-md border border-dark-border 
  text-dark-text-primary hover:bg-dark-secondary transition-colors">
```

### Link
```jsx
<Link className="text-brand-blue hover:text-brand-blue-hover transition-colors">
```

### Card
```jsx
<div className="bg-dark-secondary border border-dark-border rounded-lg p-6 
  hover:bg-dark-tertiary transition-colors">
```

## Responsive Breakpoints

```
sm: 640px   → sm:text-lg
md: 768px   → md:flex-row
lg: 1024px  → lg:block
xl: 1280px  → xl:max-w-7xl
2xl: 1536px → 2xl:px-8
```

### Common Responsive Patterns

**Mobile-first approach:**
```jsx
// Hidden on mobile, visible on desktop
<div className="hidden lg:block">

// Full width on mobile, half on desktop
<div className="w-full lg:w-1/2">

// Stack on mobile, row on desktop
<div className="flex flex-col lg:flex-row">

// Different padding per breakpoint
<div className="px-4 md:px-6 lg:px-8">
```

## Spacing Scale

```
p-0  → 0
p-1  → 0.25rem (4px)
p-2  → 0.5rem (8px)
p-3  → 0.75rem (12px)
p-4  → 1rem (16px)
p-5  → 1.25rem (20px)
p-6  → 1.5rem (24px)
p-8  → 2rem (32px)
p-10 → 2.5rem (40px)
```

## Typography

```
text-xs   → 0.75rem (12px)
text-sm   → 0.875rem (14px)
text-base → 1rem (16px)
text-lg   → 1.125rem (18px)
text-xl   → 1.25rem (20px)
text-2xl  → 1.5rem (24px)
text-3xl  → 1.875rem (30px)
```

```
font-light  → 300
font-normal → 400
font-medium → 500
font-semibold → 600
font-bold   → 700
```

## Common Layout Classes

### Flexbox
```
flex flex-col          → Column layout
flex flex-row          → Row layout
items-center           → Vertical center
justify-center         → Horizontal center
justify-between        → Space between
gap-4                  → Gap between items
```

### Grid
```
grid grid-cols-2       → 2 columns
grid grid-cols-3       → 3 columns
md:grid-cols-4         → 4 cols on medium+
gap-4                  → Gap between items
```

### Positioning
```
relative               → Relative positioning
absolute               → Absolute positioning
fixed                  → Fixed positioning
top-0 right-0          → Position to top-right
z-10, z-50             → Z-index values
```

## Hover & Focus States

```
hover:bg-dark-secondary    → Hover background
hover:text-brand-blue      → Hover text color
focus:border-brand-blue    → Focus border
focus:outline-none         → Remove outline
transition-colors          → Smooth transitions
```

## Common Component Classes

### Navigation Item
```jsx
<a className="flex items-center px-4 py-3 rounded-lg text-dark-text-primary 
  hover:bg-dark-tertiary transition-colors">
```

### Modal/Dialog
```jsx
<div className="bg-dark-tertiary border border-dark-border rounded-lg p-6 
  max-w-md mx-auto">
```

### Avatar
```jsx
<img className="w-10 h-10 rounded-full object-cover border-2 border-dark-border" />
```

### Badge
```jsx
<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs 
  rounded-full w-5 h-5 flex items-center justify-center">
```

### Divider
```jsx
<div className="border-t border-dark-border my-4"></div>
```

## Animation & Transitions

```
transition-colors      → Color transitions
transition-all         → All property transitions
duration-300           → 300ms duration
ease-in-out            → Easing function
```

## Utilities

### Width
```
w-full    → 100%
w-1/2     → 50%
w-1/3     → 33.333%
w-3/4     → 75%
max-w-xs  → 20rem (320px)
max-w-md  → 28rem (448px)
max-w-lg  → 32rem (512px)
```

### Height
```
h-screen  → 100vh
h-full    → 100%
h-10      → 2.5rem (40px)
min-h-screen → min-height: 100vh
```

### Overflow
```
overflow-hidden     → Hide overflow
overflow-x-auto     → Horizontal scroll
overflow-y-auto     → Vertical scroll
```

### Visibility
```
hidden              → display: none
block               → display: block
inline-block        → display: inline-block
```

## Mobile Touch Targets

Minimum size for touch targets:
```jsx
<button className="min-h-[44px] min-w-[44px] ...">
```

## Accessibility

```
focus:ring-2 focus:ring-brand-blue    → Focus ring
sr-only                                → Screen reader only
aria-label="..."                       → Aria label
```

## Quick Tips

1. **Mobile First**: Start with mobile styles, add breakpoints for larger screens
2. **Dark Theme**: Always use theme color variables
3. **Hover States**: Add `hover:` classes for better UX
4. **Transitions**: Add `transition-colors` or `transition-all` for smooth effects
5. **Focus States**: Always include focus styles for accessibility
6. **Consistent Spacing**: Use Tailwind's spacing scale (4, 6, 8, etc.)
7. **Responsive Text**: Adjust font sizes at different breakpoints

## Examples

### Complete Form Input
```jsx
<div className="w-full">
  <label className="block text-dark-text-secondary text-sm mb-2">
    Username
  </label>
  <input 
    type="text"
    className="w-full h-10 px-3 rounded-md 
      bg-dark-secondary border border-dark-border 
      text-dark-text-primary placeholder-dark-text-tertiary
      focus:border-brand-blue focus:outline-none 
      transition-colors"
    placeholder="Enter username"
  />
</div>
```

### Complete Card Component
```jsx
<div className="bg-dark-tertiary border border-dark-border rounded-lg p-6 
  hover:bg-dark-secondary transition-colors cursor-pointer">
  <h3 className="text-xl font-bold text-dark-text-primary mb-2">
    Card Title
  </h3>
  <p className="text-dark-text-secondary text-sm">
    Card description goes here
  </p>
  <button className="mt-4 px-4 py-2 rounded-md bg-brand-blue 
    hover:bg-brand-blue-hover text-white font-semibold transition-colors">
    Action
  </button>
</div>
```

### Responsive Grid
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 
  gap-4 md:gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```
