import React from 'react';
import { PluginClient, usePlugin, createState, useValue, Layout } from 'flipper-plugin';
import { Button, Typography } from 'antd';

type Data = {
  id: string;
  message?: string;
};

type Events = {
  newData: Data;
};

type Methods = {
  showToast(params: {action: string}): Promise<string[]>;
}

// Read more: https://fbflipper.com/docs/tutorial/js-custom#creating-a-first-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#pluginclient
export function plugin(client: PluginClient<Events, Methods>) {
  const data = createState<Record<string, Data>>({}, { persist: 'data' });
  const logs = createState<string[]>([])

  client.onMessage('newData', (newData) => {
    data.update((draft) => {
      draft["text"] = newData;
    });
  });
  async function sendToast() {
    logs.set(await client.send('showToast', {
      action: "show"
    }))
  }
  client.addMenuEntry({
    action: 'clear',
    handler: async () => {
      data.set({});
    },
  });

  return { data,sendToast };
}

// Read more: https://fbflipper.com/docs/tutorial/js-custom#building-a-user-interface-for-the-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#react-hooks
export function Component() {
  const instance = usePlugin(plugin);
  const data = useValue(instance.data);
  const text = data["text"]

  return (
    <Layout.ScrollContainer>
      <Typography.Title level={4}>Click below button to send Hie toast to flipper</Typography.Title>
      <Button type="primary"
        style={{ width: 150 }}
        onClick={() => { instance.sendToast()}}>
        Send Hie Toast</Button>
        {Object.values(data).map((row) => (
             <Typography.Title level={4}>{row.message}</Typography.Title>
            ))}
       
    </Layout.ScrollContainer>
  );
}
