export default {
    handler: [
        {
            notification: 'say-hello',
            action: 'prompt',
            mapAttributes: {
                a: 'param1.a',
                b: 'param2'
            }
        }
    ]
};


