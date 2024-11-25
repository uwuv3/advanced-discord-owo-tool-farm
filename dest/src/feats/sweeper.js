export const loadSweeper = async (agent) => {
    return agent.options.sweepers = {
        messages: {
            interval: 3_600,
            lifetime: 1_800,
        },
        users: {
            interval: 3_600,
            filter: () => user => [...agent.RETAINED_USERS_IDS, user.client.user?.id].includes(user.id),
        }
    };
};
