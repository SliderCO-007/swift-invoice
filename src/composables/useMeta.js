import { useHead } from '@vueuse/head';

export const useMeta = (title, description) => {
  useHead({
    title,
    meta: [
      {
        name: 'description',
        content: description,
      },
    ],
  });
};
