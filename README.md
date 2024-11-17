 [![Logo](./src/assets/emblem.png)](https://www.npmjs.com/package/@swypex/refilter)

<h1 align="center">@swypex/refilter</h1>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)](https://github.com/useswype/refilter/)
[![GitHub Issues](https://img.shields.io/github/issues/kylelobo/The-Documentation-Compendium.svg)]()
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/kylelobo/The-Documentation-Compendium.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---


A powerful and flexible React library to effortlessly add robust filtering capabilities to your applications, simplifies creating dynamic and interactive user interfaces, allowing users to filter through large datasets easily


## 📝 Table of Contents

- [About](#-about)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Built Using](#-built-using)
- [Contributing](https://github.com/useswype/refilter/graphs/contributors)

## 🧐 About

This project aims to enhance the filtering capabilities of tables and lists within various applications. This project aims to streamline data analysis and information retrieval processes by providing a comprehensive filtering tool package. The package offers a range of filtering options, including text search, numerical range selection, and custom filtering criteria. With its user-friendly interface and efficient algorithms, this project empowers users to quickly and accurately filter large datasets, saving time and effort.


## 🎥 Demo / Working

![Working](./src/assets/demo.gif)

## 🏁 Getting Started


### Installing
Make sure you have node version >= 16 and react version >= 16

```
npm i @swypex/refilter
``` 

add this on to `globals.css` 

```
@import '~@swypex/refilter/output/main.css';
```

## 🎈 Usage

## - If you need to add custom style for the filter 
```
import { createStyledGenericFilter } from '@swypex/refilter';

export const StyledGenericFilter = createStyledGenericFilter({
  closeButton: 'bg-red-100',
});


import { StyledGenericFilter as GenericFilter } from '@/components/GenericFilterWrapper';

<GenericFilter />
```
## - If you need to add specific style for the filter 
```
import { GenericFilter } from '@swypex/refilter';

<GenericFilter
  classNames={{
    closeButton: 'bg-red-100',
  }}
/>
```
## - If you need to use the default swypex design system  
```
import { GenericFilter } from '@swypex/refilter';

<GenericFilter />
```
## - How to create your filter component
### the filter component has the constant boilerplate code you need to follow 

```
import {
  type ShortcutComponentProps,
  type FilterComponentProps,
} from '@swypex/refilter';

export interface FilterComponentProps {
  status: Nullable<boolean>;
}

export function FilterComponent(props: FilterComponentProps<FilterComponentProps>) {
  const { onChange, value } = props;
  return (
    <div></div>
  )
}


function FilterComponentFilterShortcut(props: ShortcutComponentProps<FilterComponentProps>) {
  const { value, onChange } = props;
    return (
    <div></div>
  )
}

FilterComponent.Shortcut = FilterComponentFilterShortcut;

FilterComponent.comparator = (a: FilterComponentProps, b: FilterComponentProps) => {
  return a?.status === b?.status;
};

FilterComponent.getBadgeCount = (value: FilterComponentProps) => {
  return value.status !== null ? 1 : 0;
};

```

## ⛏️ Built Using

- [Rollup](https://rollupjs.org/)

```
npm run bundle
```

## 💭 Preview

![Working](./src/assets/preview.png)