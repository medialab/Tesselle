/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */

import { defineMessages } from 'react-intl';

export const scope = 'app.containers.HomePage';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'This is the HomePage container!',
  },
  chapo: {
    id: `${scope}.chapo`,
// tslint:disable-next-line: max-line-length
    defaultMessage: 'Glissemontre is an image annotation & publication tool. It allows to comment on specific parts of photographs, maps, visualizations, etc. to make precise visual analysis. It also embeds a tiling feature which allows to seamlessly display and navigate very large images on the web. Eventually, Glissemontre allows to export your work as a simple folder to upload anywhere on the web.',
  },
});
