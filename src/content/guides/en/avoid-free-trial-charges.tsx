import type { GuideContent } from '../../types';
const content: GuideContent = {
  intro: <p>Stub intro.</p>,
  sections: [{ id: 'a', title: 'A', body: <p>A</p> }, { id: 'b', title: 'B', body: <p>B</p> }, { id: 'c', title: 'C', body: <p>C</p> }],
  sources: [{ label: 'Example', publisher: 'Example', url: 'https://example.com' }],
  related: [],
};
export default content;
