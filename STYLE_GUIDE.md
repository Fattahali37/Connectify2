# 🎨 Premium Admin Dashboard - Style Guide

## Color System

### Background Layers
```
Layer 1 (Base):     bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
Layer 2 (Cards):    bg-slate-800/50 backdrop-blur-xl
Layer 3 (Nested):   bg-slate-900/50
```

### Brand Colors
```css
Primary Gradient:   from-blue-600 to-purple-600
Success:            green-600 to green-700  
Warning:            yellow-600 to yellow-700
Danger:             red-600 to red-700
```

### Text Colors
```css
Heading:            text-white
Body:               text-slate-300
Muted:              text-slate-400
Disabled:           text-slate-500
```

## Component Patterns

### 1. Stat Card (Gradient)
```jsx
<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
  {/* Icon Badge */}
  <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
    <Icon className="text-white" sx={{ fontSize: 32 }} />
  </div>
  
  {/* Trend Indicator */}
  <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300">
    <ArrowUpward sx={{ fontSize: 16 }} />
    <span className="text-sm font-bold">12.5%</span>
  </div>
  
  {/* Content */}
  <h3 className="text-white/70 text-sm font-medium mb-2">Total Users</h3>
  <p className="text-white text-3xl font-bold">42,500</p>
</div>
```

### 2. Chart Card (Glass)
```jsx
<div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
  <div className="flex items-center justify-between mb-6">
    <h3 className="text-xl font-bold text-white">User Growth</h3>
    <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
      <RefreshIcon className="text-slate-300" />
    </button>
  </div>
  {/* Chart Component */}
</div>
```

### 3. Action Button (Primary)
```jsx
<button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-200">
  <Icon />
  <span className="font-medium">Action</span>
</button>
```

### 4. Table Row (Hover Effect)
```jsx
<tr className="hover:bg-slate-700/30 transition-colors">
  <td className="px-6 py-4">
    <div className="flex items-center space-x-3">
      <Avatar />
      <div>
        <p className="font-medium text-white">Username</p>
        <p className="text-sm text-slate-400">Email</p>
      </div>
    </div>
  </td>
</tr>
```

### 5. Tab System
```jsx
<div className="flex space-x-2 bg-slate-800/50 backdrop-blur-xl p-2 rounded-xl border border-slate-700/50">
  <button className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
    active 
      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
      : "text-slate-400 hover:text-white hover:bg-slate-700/50"
  }`}>
    Tab Name
  </button>
</div>
```

### 6. Input Field (Dark)
```jsx
<div className="relative">
  <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
    <Icon sx={{ fontSize: 20, color: '#94a3b8' }} />
  </div>
  <input 
    className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    placeholder="Enter text"
  />
</div>
```

### 7. Status Chip
```jsx
{/* Active Status */}
<span className="px-3 py-1 text-xs font-bold bg-green-600 text-white rounded-lg">
  Active
</span>

{/* Blocked Status */}
<span className="px-3 py-1 text-xs font-bold bg-red-600 text-white rounded-lg">
  Blocked
</span>
```

### 8. Notification Badge
```jsx
<button className="relative p-2">
  <BellIcon />
  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
</button>
```

## Typography Scale

```css
Display:      text-4xl font-bold           (36px)
Heading 1:    text-3xl font-bold           (30px)
Heading 2:    text-2xl font-bold           (24px)
Heading 3:    text-xl font-bold            (20px)
Body Large:   text-base font-medium        (16px)
Body:         text-sm                      (14px)
Caption:      text-xs                      (12px)
```

## Spacing Scale

```css
xs:     space-x-1  (0.25rem / 4px)
sm:     space-x-2  (0.5rem / 8px)
md:     space-x-4  (1rem / 16px)
lg:     space-x-6  (1.5rem / 24px)
xl:     space-x-8  (2rem / 32px)
```

## Border Radius

```css
Small:      rounded-lg      (0.5rem / 8px)
Medium:     rounded-xl      (0.75rem / 12px)
Large:      rounded-2xl     (1rem / 16px)
Full:       rounded-full
```

## Shadow Scale

```css
Small:      shadow-lg
Medium:     shadow-xl
Large:      shadow-2xl
Colored:    shadow-lg shadow-blue-500/20
```

## Animation Classes

```css
Hover Lift:     hover:-translate-y-1 transition-all
Pulse:          animate-pulse
Fade In:        transition-opacity duration-300
Smooth:         transition-all duration-200
```

## Responsive Utilities

```css
Mobile First:       Default (< 768px)
Tablet:             md: prefix (768px+)
Desktop:            lg: prefix (1024px+)
Large Desktop:      xl: prefix (1280px+)

Example:
<div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
```

## Chart Theming

```jsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
    <XAxis stroke="#94a3b8" />
    <YAxis stroke="#94a3b8" />
    <Tooltip 
      contentStyle={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '0.5rem',
        color: '#fff'
      }}
    />
    <Area fill="url(#colorGradient)" />
  </AreaChart>
</ResponsiveContainer>
```

## Best Practices

### ✅ DO
- Use backdrop-blur for glass morphism
- Add hover states to interactive elements
- Use gradient backgrounds for emphasis
- Include loading states
- Provide visual feedback
- Use consistent spacing
- Add smooth transitions

### ❌ DON'T
- Mix too many gradient directions
- Forget mobile responsiveness
- Skip hover/active states
- Use jarring animations
- Ignore accessibility
- Overcrowd the interface

## Accessibility

```jsx
{/* Always include proper labels */}
<button 
  className="..."
  aria-label="Delete user"
  title="Delete user"
>
  <DeleteIcon />
</button>

{/* Use semantic HTML */}
<nav>...</nav>
<main>...</main>
<section>...</section>

{/* Ensure sufficient contrast */}
Text on dark-900: Use white or slate-100
Text on blue-600: Use white
```

## Quick Reference

| Element | Class Pattern |
|---------|--------------|
| Container | `max-w-7xl mx-auto px-6` |
| Card | `bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50` |
| Button | `px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl` |
| Input | `bg-slate-900/50 border border-slate-700 rounded-xl` |
| Text | `text-white` (heading), `text-slate-300` (body) |
| Shadow | `shadow-xl hover:shadow-2xl` |

---

**Quick Copy Patterns Available** ✨
Use these as starting points for consistent styling across the application.
