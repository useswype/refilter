 [![Logo](./src/assets/emblem.png)](https://www.npmjs.com/package/@swypex/refilter)

<h1 align="center">@swypex/refilter</h1>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)](https://github.com/useswype/refilter/)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/useswype/refilter)](https://github.com/useswype/refilter/pulls)
[![GitHub Issues](https://img.shields.io/github/issues/useswype/refilter)](https://github.com/useswype/refilter/issues)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---


A powerful and flexible React library to effortlessly add robust filtering capabilities to your applications, simplifies creating dynamic and interactive user interfaces, allowing users to filter through large datasets easily.


## 📝 Table of Contents

- [About](#-about)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Built Using](#-built-using)
- [Contributing](https://github.com/useswype/refilter/graphs/contributors)

## 🧐 About

This package is an ideal solution for implementing advanced, strongly-typed filtering systems. By focusing on managing filter states and interactions, it allows developers to invest their time where it matters most: creating tailored filter UIs and handling business logic.

### Key Features
- Simplified State Management: Offload the complexity of managing filter states, freeing you to focus on building filter-specific UI and business logic.
- Dynamic Badge System: Automatically generate badges for applied filters, offering quick access to remove or modify them.
- Customizable UI: Define the rendering of badges, sidepanel items & content for each filter.
- Overridable Styles: Customize all class names, or use the provided HOC to style the component once and return a tailored version.
- Strongly Typed: Built with TypeScript, ensuring a type-safe and robust developer experience.


## 🎥 Demo / Working

![Working](./src/assets/demo.gif)

## 💭 Preview

![Working](./src/assets/preview.png)

## 🏁 Getting Started


### Installation
Make sure you have node version >= 16 and react version >= 16

```
npm i @swypex/refilter
``` 

Import this style sheet 

```
@import '~@swypex/refilter/output/main.css';
```

## 🎈 Usage

### Default Swypex design  
```
import { GenericFilter } from '@swypex/refilter';

<GenericFilter />
```

### Custom styled generic filter
```
import { createStyledGenericFilter } from '@swypex/refilter';

export const StyledGenericFilter = createStyledGenericFilter({
  closeButton: 'bg-red-100',
});


import { StyledGenericFilter as GenericFilter } from '@/components/GenericFilterWrapper';

<GenericFilter />
```
### Specific style for the filter 
```
import { GenericFilter } from '@swypex/refilter';

<GenericFilter
  classNames={{
    closeButton: 'bg-red-100',
  }}
/>
```
## How to create your filter component
### the filter component has the constant boilerplate code you need to follow 

```
export interface FilterComponentValue {
  value: Nullable<boolean>;
}

export function FilterComponent(
  props: FilterComponentProps<FilterComponentValue>
) {
  const { onChange, value } = props;
  return <div></div>;
}

function FilterComponentFilterShortcut(
  props: ShortcutComponentProps<FilterComponentValue>
) {
  const { value, onChange } = props;
  return <div></div>;
}

FilterComponent.Shortcut = FilterComponentFilterShortcut;

FilterComponent.comparator = (
  a: FilterComponentValue,
  b: FilterComponentValue
) => {
  return a.value === b.value;
};

FilterComponent.getBadgeCount = (value: FilterComponentValue) => {
  return value.value !== null ? 1 : 0;
};
```

## ⛏️ Built Using
- [React](https://react.dev/)
- [Tailwind](https://tailwindcss.com/)
- [Typescript](https://www.typescriptlang.org/)
- [Rollup](https://rollupjs.org/)

