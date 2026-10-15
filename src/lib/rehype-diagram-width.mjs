// Expone el ancho natural de cada diagrama Mermaid (atributo width del <img>) como
// variable CSS --w, para que en móvil se escale según su tamaño real (ver global.css).
import { visit } from 'unist-util-visit';

export default function rehypeDiagramWidth() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img' || !String(node.properties?.id ?? '').startsWith('mermaid-'))
        return;
      const width = Number.parseFloat(node.properties.width);
      if (!Number.isFinite(width)) return;
      const style = node.properties.style ? `${node.properties.style};` : '';
      node.properties.style = `${style}--w:${Math.round(width)}px`;
    });
  };
}
