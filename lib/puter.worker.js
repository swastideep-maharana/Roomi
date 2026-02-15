const PROJECT_PREFIX = 'roomify_project_';

const jsonError = (status, message, extra = {}) => {
    return new Response(JSON.stringify({ status, message, ...extra }), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        }
    })
}

const getUserId = async (userPuter) => {
    try {
        const user = await userPuter.auth.getUser();
        return user?.uuid || null;
    } catch (error) {
        return null;
    }
}

router.post('/api/projects/save', async ({ request, user }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const body = await request.json();
        const project = body?.project;

        if (!project?.id || !project?.sourceImage) return jsonError(400, 'Invalid project data');

        const payload = {
            ...project,
            updatedAt: new Date().toISOString(),
        }

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const key = `${PROJECT_PREFIX}${project.id}`;
        await userPuter.kv.set(key, payload);

        return jsonError(200, 'Project saved successfully', { project: payload });
    } catch (e) {
        return jsonError(500, 'Failed to save project', { message: e.message })
    }
})

router.get('/api/projects/list', async ({ user }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const names = await userPuter.kv.list(PROJECT_PREFIX);
        const projects = await Promise.all(names.map(name => userPuter.kv.get(name)));

        return jsonError(200, 'Projects retrieved successfully', { projects });
    } catch (e) {
        return jsonError(500, 'Failed to list projects', { message: e.message });
    }
})

router.get('/api/projects/get', async ({ request, user }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) return jsonError(400, 'Missing project ID');

        const project = await userPuter.kv.get(`${PROJECT_PREFIX}${id}`);
        if (!project) return jsonError(404, 'Project not found');

        return jsonError(200, 'Project retrieved successfully', { project });
    } catch (e) {
        return jsonError(500, 'Failed to fetch project', { message: e.message });
    }
})

router.delete('/api/projects/delete', async ({ request, user }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) return jsonError(400, 'Missing project ID');

        const key = `${PROJECT_PREFIX}${id}`;
        await userPuter.kv.del(key);

        return jsonError(200, 'Project deleted successfully');
    } catch (e) {
        return jsonError(500, 'Failed to delete project', { message: e.message });
    }
})

router.post('/api/projects/update', async ({ request, user }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const body = await request.json();
        const { id, updates } = body;

        if (!id || !updates) return jsonError(400, 'Missing ID or updates');

        const key = `${PROJECT_PREFIX}${id}`;
        const existing = await userPuter.kv.get(key);
        if (!existing) return jsonError(404, 'Project not found');

        const updated = {
            ...existing,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        await userPuter.kv.set(key, updated);

        return jsonError(200, 'Project updated successfully', { project: updated });
    } catch (e) {
        return jsonError(500, 'Failed to update project', { message: e.message });
    }
})