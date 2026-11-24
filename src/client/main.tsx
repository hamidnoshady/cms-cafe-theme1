import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import './styles.css';
import { MenuToolbar } from './MenuToolbar';
import { ModifierPicker } from './ModifierPicker';
import type { ModifierSelection, ProductView, ThemeData, ThemeStrings } from './types';

const modifierRoots = new WeakMap<HTMLElement, Root>();

function getOrCreateRoot(container: HTMLElement): Root {
  let root = modifierRoots.get(container);
  if (!root) {
    container.replaceChildren();
    root = createRoot(container);
    modifierRoots.set(container, root);
  }
  return root;
}

window.eshobeRenderModifiers = (
  container: HTMLElement,
  product: ProductView,
  selection: ModifierSelection,
  onChange: (nextSelection: ModifierSelection) => void,
  strings: ThemeStrings,
  locale: string,
) => {
  const groups = product.modifiers || [];
  container.hidden = !groups.length;
  const root = getOrCreateRoot(container);
  root.render(
    <ModifierPicker
      groups={groups}
      selection={selection}
      onSelectionChange={onChange}
      strings={strings}
      locale={locale}
    />,
  );
};

window.eshobeUnmountModifiers = (container: HTMLElement) => {
  const root = modifierRoots.get(container);
  if (root) {
    root.unmount();
    modifierRoots.delete(container);
  }
};

function mountToolbar() {
  const dataNode = document.getElementById('theme-data');
  const toolbarHost = document.getElementById('menu-toolbar-root');
  if (!dataNode || !toolbarHost) return;
  try {
    const data = JSON.parse(dataNode.textContent || '{}') as ThemeData;
    if (!Array.isArray(data.products) || !data.products.length) return;
    createRoot(toolbarHost).render(<MenuToolbar data={data} />);
  } catch {
    // Ignore malformed payload; SSR menu remains fully usable
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountToolbar, { once: true });
} else {
  mountToolbar();
}
