import { useHead } from '@vueuse/head';

export const useMeta = (title, description, schema = null) => {
  const headConfig = {
    title,
    meta: [
      {
        name: 'description',
        content: description,
      },
    ],
  };

  if (schema) {
    headConfig.script = [
      {
        type: 'application/ld+json',
        children: JSON.stringify(schema),
      },
    ];
  }

  useHead(headConfig);
};
