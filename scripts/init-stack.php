<?php

declare(strict_types=1);

/** Initialize the local Zoltasoft Starter and Tasks Identity projects. */

$root = dirname(__DIR__);
$templatePath = $root . '/scripts/identity-bootstrap.template.json';
$template = json_decode((string) file_get_contents($templatePath), true, 512, JSON_THROW_ON_ERROR);
if (!is_array($template) || ($template['version'] ?? null) !== 2 || !is_array($template['projects'] ?? null)) {
    throw new RuntimeException('Zoltasoft Identity bootstrap template is invalid or unsupported.');
}
$projectConfigurations = $template['projects'];
foreach (['starter', 'tasks'] as $projectKey) {
    if (!is_array($projectConfigurations[$projectKey] ?? null)) {
        throw new RuntimeException('The Identity bootstrap template must define the starter and tasks projects.');
    }
}

$opsEnv = $root . '/../local-dev-ops/local/.env';
$identityConsole = $root . '/apps/identity-console';
$identityServer = $root . '/apps/identity-server';
$identityServerEnv = $identityServer . '/.env.starter';
$identityConsoleEnv = $identityConsole . '/.env.starter';
$logoAssetsRoot = $root . '/scripts/assets/identity';
$apiEnv = $root . '/apps/api/.env';
$webEnv = $root . '/apps/web/.env';

$env = static function (string $key, ?string $fallback = null): ?string {
    $value = getenv($key);
    return $value === false || $value === '' ? $fallback : $value;
};
$readEnv = static function (string $path): array {
    if (!is_file($path)) return [];
    $values = [];
    foreach (file($path, FILE_IGNORE_NEW_LINES) ?: [] as $line) {
        if (preg_match('/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/', $line, $m) !== 1) continue;
        $value = trim($m[2]);
        if (strlen($value) >= 2 && $value[0] === '"' && $value[-1] === '"') $value = stripcslashes(substr($value, 1, -1));
        if (strlen($value) >= 2 && $value[0] === "'" && $value[-1] === "'") $value = substr($value, 1, -1);
        $values[$m[1]] = $value;
    }
    return $values;
};
$writeEnv = static function (string $path, array $updates) use ($readEnv): void {
    $lines = is_file($path) ? (file($path, FILE_IGNORE_NEW_LINES) ?: []) : [];
    $seen = [];
    foreach ($lines as &$line) {
        if (preg_match('/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/', $line, $m) !== 1 || !array_key_exists($m[1], $updates)) continue;
        $key = $m[1];
        $line = $key . '=' . (preg_match('/^[A-Za-z0-9_\.\/:@%+,-]+$/', (string) $updates[$key]) === 1 ? $updates[$key] : '"' . addcslashes((string) $updates[$key], "\\\"") . '"');
        $seen[$key] = true;
    }
    unset($line);
    foreach ($updates as $key => $value) if (!isset($seen[$key])) $lines[] = $key . '=' . (preg_match('/^[A-Za-z0-9_\.\/:@%+,-]+$/', (string) $value) === 1 ? $value : '"' . addcslashes((string) $value, "\\\"") . '"');
    if (!is_dir(dirname($path))) mkdir(dirname($path), 0775, true);
    file_put_contents($path, implode(PHP_EOL, $lines) . PHP_EOL, LOCK_EX);
    chmod($path, 0600);
};

$identityUrl = rtrim($env('ZOLTA_IDENTITY_API_URL', 'http://127.0.0.1:8201'), '/');
$appUrl = rtrim($env('ZOLTA_STARTER_SITE_URL', 'http://localhost:3300'), '/');
$ownerEmail = $env('ZOLTA_IDENTITY_OWNER_EMAIL', 'owner@example.com');
$ownerName = $env('ZOLTA_IDENTITY_OWNER_NAME', 'Local Installation Owner');
$opsValues = $readEnv($opsEnv);
$existingApiEnv = $readEnv($apiEnv);
$existingWebEnv = $readEnv($webEnv);
$hostedToken = $env('ZOLTA_IDENTITY_HOSTED_APPLICATIONS_TOKEN', $opsValues['STARTER_IDENTITY_HOSTED_APPLICATIONS_TOKEN'] ?? base64_encode(random_bytes(32)));

foreach ($projectConfigurations as $projectKey => $configuration) {
    if (!isset($configuration['name'], $configuration['slug'], $configuration['clients'], $configuration['registration'], $configuration['permissions'], $configuration['roles'], $configuration['hostedApplication'])
        || !is_array($configuration['clients']) || !is_array($configuration['registration']) || !is_array($configuration['permissions'])
        || !is_array($configuration['roles']) || !is_array($configuration['hostedApplication'])) {
        throw new RuntimeException('Identity project configuration is incomplete: ' . $projectKey);
    }
    foreach (['bff'] as $clientKey) {
        if (!is_string($configuration['clients'][$clientKey] ?? null) || trim($configuration['clients'][$clientKey]) === '') {
            throw new RuntimeException('Identity project client configuration is missing: ' . $projectKey . '.' . $clientKey);
        }
    }
    $permissionKeys = [];
    foreach ($configuration['permissions'] as $permission) {
        if (!is_array($permission) || !isset($permission['key'], $permission['name'])) throw new RuntimeException('Invalid permission in Identity project: ' . $projectKey);
        $permissionKeys[$permission['key']] = true;
    }
    $roleSlugs = [];
    foreach ($configuration['roles'] as $role) {
        if (!is_array($role) || !isset($role['name'], $role['slug']) || !is_array($role['permissions'] ?? null)) throw new RuntimeException('Invalid role in Identity project: ' . $projectKey);
        $roleSlugs[$role['slug']] = true;
        foreach ($role['permissions'] as $permissionKey) if (!isset($permissionKeys[$permissionKey])) throw new RuntimeException('Role refers to an undefined permission: ' . $projectKey . '.' . $permissionKey);
    }
    if (!in_array($configuration['registration']['mode'] ?? null, ['invite_only', 'public'], true) || !is_bool($configuration['registration']['emailVerificationRequired'] ?? null) || !isset($roleSlugs[$configuration['registration']['defaultRole'] ?? ''])) {
        throw new RuntimeException('Invalid registration policy in Identity project: ' . $projectKey);
    }
    $application = $configuration['hostedApplication'];
    $logoFile = $application['logo'] ?? null;
    if (($application['primaryClient'] ?? null) !== 'bff'
        || !preg_match('/^\/[A-Za-z0-9_\/-]+$/', (string) ($application['callbackPath'] ?? ''))
        || !preg_match('/^#[0-9A-Fa-f]{6}$/', (string) ($application['appearance']['accent_color'] ?? ''))
        || !is_string($logoFile)
        || basename($logoFile) !== $logoFile
        || strtolower(pathinfo($logoFile, PATHINFO_EXTENSION)) !== 'png'
        || !is_file($logoAssetsRoot . '/' . $logoFile)) {
        throw new RuntimeException('Invalid hosted application in Identity project: ' . $projectKey);
    }
}
if (preg_match('/^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?$/', $identityUrl) !== 1) {
    fwrite(STDERR, "Refusing to initialize a non-local Identity URL. Set ZOLTA_IDENTITY_API_URL to localhost for local setup.\n");
    exit(1);
}

$request = static function (string $method, string $path, ?array $payload = null, ?string $token = null) use ($identityUrl): array {
    $headers = ['Accept: application/json', 'Content-Type: application/json'];
    if ($token !== null) $headers[] = 'Authorization: Bearer ' . $token;
    $context = stream_context_create(['http' => ['method' => $method, 'header' => implode("\n", $headers), 'content' => $payload === null ? '' : json_encode($payload, JSON_THROW_ON_ERROR), 'ignore_errors' => true, 'timeout' => 15]]);
    $body = @file_get_contents($identityUrl . '/api/' . ltrim($path, '/'), false, $context);
    $status = 0;
    foreach ($http_response_header ?? [] as $header) if (preg_match('/^HTTP\/\S+\s+(\d+)/', $header, $m)) $status = (int) $m[1];
    $json = json_decode($body ?: '', true);
    if ($status < 200 || $status >= 300 || !is_array($json)) {
        $detail = is_array($json) ? json_encode(['errors' => $json['errors'] ?? null, 'message' => $json['message'] ?? null], JSON_UNESCAPED_SLASHES) : 'invalid JSON';
        throw new RuntimeException("Identity request failed: {$method} {$path} (HTTP {$status}): {$detail}");
    }
    return $json;
};
$upload = static function (string $path, string $filePath, string $token) use ($identityUrl): array {
    $contents = file_get_contents($filePath);
    if ($contents === false) throw new RuntimeException('Unable to read hosted application logo: ' . basename($filePath));
    $boundary = '----ZoltaBootstrap' . bin2hex(random_bytes(16));
    $filename = basename($filePath);
    $body = '--' . $boundary . "\r\n"
        . 'Content-Disposition: form-data; name="logo"; filename="' . $filename . "\"\r\n"
        . "Content-Type: image/png\r\n\r\n"
        . $contents . "\r\n"
        . '--' . $boundary . "--\r\n";
    $headers = [
        'Accept: application/json',
        'Authorization: Bearer ' . $token,
        'Content-Type: multipart/form-data; boundary=' . $boundary,
    ];
    $context = stream_context_create(['http' => ['method' => 'POST', 'header' => implode("\n", $headers), 'content' => $body, 'ignore_errors' => true, 'timeout' => 15]]);
    $responseBody = @file_get_contents($identityUrl . '/api/' . ltrim($path, '/'), false, $context);
    $status = 0;
    foreach ($http_response_header ?? [] as $header) if (preg_match('/^HTTP\/\S+\s+(\d+)/', $header, $m)) $status = (int) $m[1];
    $json = json_decode($responseBody ?: '', true);
    if ($status < 200 || $status >= 300 || !is_array($json)) {
        $detail = is_array($json) ? json_encode(['errors' => $json['errors'] ?? null, 'message' => $json['message'] ?? null], JSON_UNESCAPED_SLASHES) : 'invalid JSON';
        throw new RuntimeException("Identity logo upload failed: POST {$path} (HTTP {$status}): {$detail}");
    }
    return $json;
};

if (!is_file($identityServerEnv)) {
    copy($identityServer . '/.env.example', $identityServerEnv);
    $writeEnv($identityServerEnv, ['APP_URL' => $identityUrl, 'IDENTITY_CONSOLE_URL' => 'http://127.0.0.1:3201']);
    if (!is_file($identityServer . '/database/database.sqlite')) touch($identityServer . '/database/database.sqlite');
    $workingDirectory = getcwd();
    if (!chdir($identityServer)) throw new RuntimeException('Unable to enter the embedded Identity server directory.');
    passthru('php artisan key:generate --force', $code); if ($code !== 0) { chdir($workingDirectory); exit($code); }
    passthru('php artisan migrate --force', $code); if ($code !== 0) { chdir($workingDirectory); exit($code); }
    chdir($workingDirectory);
}

$console = $readEnv($identityConsoleEnv);
$server = $readEnv($identityServerEnv);
$consoleClientId = $console['IDENTITY_CLIENT_ID'] ?? $server['IDENTITY_CLIENT_ID'] ?? $opsValues['STARTER_IDENTITY_CONSOLE_CLIENT_ID'] ?? null;
$consoleClientSecret = $console['IDENTITY_CLIENT_SECRET'] ?? $server['IDENTITY_CLIENT_SECRET'] ?? $opsValues['STARTER_IDENTITY_CONSOLE_CLIENT_SECRET'] ?? null;
$ownerEmail = $server['ZOLTA_BOOTSTRAP_OWNER_EMAIL'] ?? $ownerEmail;
$ownerPassword = $env('ZOLTA_IDENTITY_OWNER_PASSWORD') ?? ($server['ZOLTA_BOOTSTRAP_OWNER_PASSWORD'] ?? null);
if (!$consoleClientId || !$consoleClientSecret) {
    if (!$ownerPassword) {
        if (!defined('STDIN') || !stream_isatty(STDIN)) throw new RuntimeException('First Identity initialization must be run interactively or supplied with ZOLTA_IDENTITY_OWNER_PASSWORD.');
        fwrite(STDERR, 'Owner name: ');
        $ownerName = trim((string) fgets(STDIN));
        fwrite(STDERR, 'Owner email: ');
        $ownerEmail = trim((string) fgets(STDIN));
        fwrite(STDERR, 'Owner password (input hidden): ');
        $stty = @shell_exec('stty -g');
        @system('stty -echo');
        $ownerPassword = trim((string) fgets(STDIN));
        @system('stty ' . trim((string) $stty));
        fwrite(STDERR, PHP_EOL);
    }
    $consoleClientId = trim((string) shell_exec('cat /proc/sys/kernel/random/uuid'));
    $clientSecret = bin2hex(random_bytes(32));
    $composeFile = $root . '/../local-dev-ops/local/compose.yaml';
    $composeEnv = $root . '/../local-dev-ops/local/.env';
    $command = is_file($composeFile) ? 'docker compose --env-file ' . escapeshellarg($composeEnv) . ' -f ' . escapeshellarg($composeFile) . ' run --rm --no-deps starter-identity-api php artisan identity:bootstrap ' . escapeshellarg($ownerEmail) . ' --name=' . escapeshellarg($ownerName) . ' --password=' . escapeshellarg($ownerPassword) . ' --client-id=' . escapeshellarg($consoleClientId) . ' --client-secret=' . escapeshellarg($clientSecret) . ' --if-needed' : 'cd ' . escapeshellarg($identityServer) . ' && php artisan identity:bootstrap ' . escapeshellarg($ownerEmail) . ' --name=' . escapeshellarg($ownerName) . ' --password=' . escapeshellarg($ownerPassword) . ' --client-id=' . escapeshellarg($consoleClientId) . ' --client-secret=' . escapeshellarg($clientSecret) . ' --if-needed';
    exec($command . ' 2>&1', $output, $code);
    if ($code !== 0) throw new RuntimeException('Identity bootstrap failed. Check the Identity server output and try again.');
    $consoleClientSecret = $clientSecret;
}
if (!$ownerPassword) throw new RuntimeException('Identity is already bootstrapped but the owner password is unavailable.');
$login = $request('POST', 'v1/identity/auth/login', ['client_id' => $consoleClientId, 'client_secret' => $consoleClientSecret, 'project' => 'identity-console', 'email' => $ownerEmail, 'password' => $ownerPassword]);
$token = $login['data']['access_token'] ?? null;
if (!$token) throw new RuntimeException('Identity login succeeded without an access token.');

$findByField = static function (array $value, string $field, string $match) use (&$findByField): ?array {
    if (isset($value[$field], $value['id']) && $value[$field] === $match) return $value;
    foreach ($value as $child) if (is_array($child)) { $found = $findByField($child, $field, $match); if ($found !== null) return $found; }
    return null;
};
$allProjects = $request('GET', 'v1/identity/projects', null, $token);
$provisioned = [];
foreach ($projectConfigurations as $projectKey => $configuration) {
    $project = $findByField($allProjects, 'slug', $configuration['slug']) ?? $findByField($allProjects, 'name', $configuration['name']);
    if ($project === null) {
        $created = $request('POST', 'v1/identity/projects', ['name' => $configuration['name'], 'slug' => $configuration['slug'], 'description' => $configuration['description']], $token);
        $project = $created['data']['project'] ?? $created['data'] ?? null;
    }
    if (!is_array($project) || !isset($project['id'])) throw new RuntimeException('Identity project provisioning returned no project: ' . $projectKey);
    $projectId = $project['id'];
    $details = $request('GET', 'v1/identity/projects/' . $projectId, null, $token)['data'] ?? [];
    $clients = [];
    foreach ($configuration['clients'] as $clientKey => $clientName) {
        $client = $findByField((array) ($details['clients'] ?? []), 'name', $clientName);
        if ($client === null) {
            $created = $request('POST', 'v1/identity/projects/' . $projectId . '/clients', ['name' => $clientName], $token);
            $client = $created['data']['client'] ?? $created['data'] ?? null;
        } elseif (!isset($client['client_secret'])) {
            $rotated = $request('POST', 'v1/identity/projects/' . $projectId . '/clients/' . $client['id'] . '/rotate-secret', null, $token);
            $client = $rotated['data']['client'] ?? $rotated['data'] ?? $client;
        }
        if (!is_array($client) || !isset($client['id'])) throw new RuntimeException('Identity client provisioning returned no client: ' . $projectKey . '.' . $clientKey);
        $clients[$clientKey] = $client;
    }
    $permissionClient = $clients['api'] ?? $clients['bff'];
    $request('PUT', 'v1/identity/projects/' . $projectId . '/clients/' . $permissionClient['id'] . '/permission-manifest', ['permissions' => $configuration['permissions']], $token);
    $details = $request('GET', 'v1/identity/projects/' . $projectId, null, $token)['data'] ?? [];
    $permissionIds = [];
    foreach ((array) ($details['permissions'] ?? []) as $permission) if (isset($permission['key'], $permission['id']) && ($permission['status'] ?? 'active') === 'active') $permissionIds[$permission['key']] = $permission['id'];
    $roleIds = [];
    foreach ($configuration['roles'] as $roleConfiguration) {
        $role = $findByField((array) ($details['roles'] ?? []), 'slug', $roleConfiguration['slug']);
        if ($role === null) {
            $created = $request('POST', 'v1/identity/projects/' . $projectId . '/roles', ['name' => $roleConfiguration['name'], 'slug' => $roleConfiguration['slug'], 'description' => $roleConfiguration['description']], $token);
            $role = $created['data']['role'] ?? $created['data'] ?? null;
        }
        if (!is_array($role) || !isset($role['id'])) throw new RuntimeException('Identity role provisioning returned no role: ' . $projectKey);
        $permissionIdsForRole = [];
        foreach ($roleConfiguration['permissions'] as $permissionKey) if (isset($permissionIds[$permissionKey])) $permissionIdsForRole[] = $permissionIds[$permissionKey]; else throw new RuntimeException('Configured role permission is missing: ' . $projectKey . '.' . $permissionKey);
        $request('PUT', 'v1/identity/projects/' . $projectId . '/roles/' . $role['id'] . '/permissions', ['permission_ids' => $permissionIdsForRole], $token);
        $roleIds[$roleConfiguration['slug']] = $role['id'];
    }
    $request('PATCH', 'v1/identity/projects/' . $projectId . '/registration', ['registration_mode' => $configuration['registration']['mode'], 'registration_role_id' => $roleIds[$configuration['registration']['defaultRole']], 'email_verification_required' => $configuration['registration']['emailVerificationRequired']], $token);
    $application = $configuration['hostedApplication'];
    $details = $request('GET', 'v1/identity/projects/' . $projectId, null, $token)['data'] ?? [];
    $hostedPayload = ['name' => $application['name'], 'key' => $application['key'], 'primary_client_id' => $clients['bff']['id'], 'application_url' => $appUrl, 'callback_url' => $appUrl . $application['callbackPath'], 'auth_page_set' => $application['authPageSet'], 'appearance' => $application['appearance'], 'authentication' => $application['authentication']];
    $hosted = $findByField((array) ($details['hosted_applications'] ?? []), 'key', $application['key']);
    if ($hosted === null) {
        $legacyHosted = null;
        foreach ((array) ($details['hosted_applications'] ?? []) as $candidate) {
            if (($candidate['primary_client_id'] ?? $candidate['primaryClientId'] ?? null) === $clients['bff']['id']) {
                $legacyHosted = $candidate;
                break;
            }
        }
        if (is_array($legacyHosted) && isset($legacyHosted['id'], $legacyHosted['key'])) {
            $request('DELETE', 'v1/identity/projects/' . $projectId . '/hosted-applications/' . $legacyHosted['id'], null, $token);
        }
    }
    if ($hosted === null) {
        $created = $request('POST', 'v1/identity/projects/' . $projectId . '/hosted-applications', $hostedPayload, $token);
        $hosted = $created['data']['hosted_application'] ?? $created['data'] ?? null;
    } else {
        $request('PATCH', 'v1/identity/projects/' . $projectId . '/hosted-applications/' . $hosted['id'], $hostedPayload + ['status' => 'active'], $token);
    }
    if (!is_array($hosted) || !isset($hosted['id'])) throw new RuntimeException('Hosted application provisioning returned no application: ' . $projectKey);
    $upload('v1/identity/projects/' . $projectId . '/hosted-applications/' . $hosted['id'] . '/logo', $logoAssetsRoot . '/' . $application['logo'], $token);
    $details = $request('GET', 'v1/identity/projects/' . $projectId, null, $token)['data'] ?? [];
    $agentEmail = $server['ZOLTA_AGENT_EMAIL'] ?? 'agent@zoltasoft.com';
    $agentPassword = $server['ZOLTA_AGENT_PASSWORD'] ?? null;
    $membership = null;
    foreach ((array) ($details['memberships'] ?? []) as $candidate) if (($candidate['user']['email'] ?? '') === $agentEmail) { $membership = $candidate; break; }
    if ($membership === null) {
        $agentPassword ??= base64_encode(random_bytes(24));
        $registrationClient = $clients['api'] ?? $clients['bff'];
        $registered = $request('POST', 'v1/identity/auth/register', ['client_id' => $registrationClient['id'], 'client_secret' => $registrationClient['client_secret'] ?? ($projectKey === 'tasks' ? ($existingApiEnv['IDENTITY_CLIENT_SECRET'] ?? '') : ($existingWebEnv['ZOLTA_STARTER_IDENTITY_CLIENT_SECRET'] ?? '')), 'project' => $configuration['slug'], 'username' => 'agent', 'email' => $agentEmail, 'password' => $agentPassword, 'password_confirmation' => $agentPassword], $token);
        $membership = $registered['data']['identity']['membership'] ?? null;
    }
    if (!is_array($membership) || !isset($membership['id'])) throw new RuntimeException('Agent membership could not be provisioned: ' . $projectKey);
    $request('PUT', 'v1/identity/projects/' . $projectId . '/memberships/' . $membership['id'] . '/access', ['role_ids' => (array) ($membership['role_ids'] ?? []), 'permission_ids' => (array) ($membership['direct_permission_ids'] ?? []), 'is_admin' => true, 'status' => 'active'], $token);
    $provisioned[$projectKey] = ['project' => $project, 'clients' => $clients, 'application' => $application, 'agentPassword' => $agentPassword];
}

$starter = $provisioned['starter'];
$tasks = $provisioned['tasks'];
$starterBff = $starter['clients']['bff'];
$tasksApi = $tasks['clients']['api'];
$tasksBff = $tasks['clients']['bff'];
$writeEnv($identityServerEnv, ['ZOLTA_AGENT_EMAIL' => $server['ZOLTA_AGENT_EMAIL'] ?? 'agent@zoltasoft.com', 'ZOLTA_AGENT_PASSWORD' => $tasks['agentPassword'], 'ZOLTA_BOOTSTRAP_OWNER_EMAIL' => $ownerEmail, 'ZOLTA_BOOTSTRAP_OWNER_PASSWORD' => $ownerPassword, 'IDENTITY_HOSTED_APPLICATIONS_TOKEN' => $hostedToken]);
$writeEnv($apiEnv, ['IDENTITY_API_URL' => $identityUrl, 'IDENTITY_PROJECT' => $tasks['project']['slug'], 'IDENTITY_CLIENT_ID' => $tasksApi['id'], 'IDENTITY_CLIENT_SECRET' => $tasksApi['client_secret'] ?? ($existingApiEnv['IDENTITY_CLIENT_SECRET'] ?? ''), 'IDENTITY_SANDBOX_API_URL' => $identityUrl, 'IDENTITY_SANDBOX_PROJECT' => $tasks['project']['slug']]);
$writeEnv($webEnv, ['ZOLTA_STARTER_SITE_URL' => $appUrl, 'ZOLTA_STARTER_IDENTITY_API_URL' => $identityUrl, 'ZOLTA_STARTER_IDENTITY_AUTH_URL' => 'http://127.0.0.1:3201', 'ZOLTA_STARTER_IDENTITY_APPLICATION' => $starter['application']['key'], 'ZOLTA_STARTER_IDENTITY_PROJECT' => $starter['project']['slug'], 'ZOLTA_STARTER_IDENTITY_CLIENT_ID' => $starterBff['id'], 'ZOLTA_STARTER_IDENTITY_CLIENT_SECRET' => $starterBff['client_secret'] ?? ($existingWebEnv['ZOLTA_STARTER_IDENTITY_CLIENT_SECRET'] ?? ''), 'ZOLTA_STARTER_IDENTITY_CALLBACK_URL' => $appUrl . $starter['application']['callbackPath'], 'ZOLTA_PROJECTS_IDENTITY_API_URL' => $identityUrl, 'ZOLTA_PROJECTS_IDENTITY_AUTH_URL' => 'http://127.0.0.1:3201', 'ZOLTA_PROJECTS_IDENTITY_APPLICATION' => $tasks['application']['key'], 'ZOLTA_PROJECTS_IDENTITY_PROJECT' => $tasks['project']['slug'], 'ZOLTA_PROJECTS_IDENTITY_CLIENT_ID' => $tasksBff['id'], 'ZOLTA_PROJECTS_IDENTITY_CLIENT_SECRET' => $tasksBff['client_secret'] ?? ($existingWebEnv['ZOLTA_PROJECTS_IDENTITY_CLIENT_SECRET'] ?? ''), 'ZOLTA_PROJECTS_IDENTITY_CALLBACK_URL' => $appUrl . $tasks['application']['callbackPath'], 'ZOLTA_STARTER_API_URL' => 'http://starter-api:8000', 'NUXT_ZOLTA_IDENTITY_SESSION_SECRET' => ($existingWebEnv['NUXT_ZOLTA_IDENTITY_SESSION_SECRET'] ?? base64_encode(random_bytes(32))), 'NUXT_SESSION_PASSWORD' => ($existingWebEnv['NUXT_SESSION_PASSWORD'] ?? base64_encode(random_bytes(32)))]);
$writeEnv($opsEnv, ['STARTER_IDENTITY_HOSTED_APPLICATIONS_TOKEN' => $hostedToken, 'STARTER_IDENTITY_PROJECT' => $starter['project']['slug'], 'STARTER_IDENTITY_APPLICATION' => $starter['application']['key'], 'STARTER_IDENTITY_CLIENT_ID' => $starterBff['id'], 'STARTER_IDENTITY_CLIENT_SECRET' => $starterBff['client_secret'] ?? '', 'STARTER_PROJECTS_IDENTITY_PROJECT' => $tasks['project']['slug'], 'STARTER_PROJECTS_IDENTITY_APPLICATION' => $tasks['application']['key'], 'STARTER_PROJECTS_IDENTITY_CLIENT_ID' => $tasksBff['id'], 'STARTER_PROJECTS_IDENTITY_CLIENT_SECRET' => $tasksBff['client_secret'] ?? '', 'STARTER_PROJECTS_API_IDENTITY_CLIENT_ID' => $tasksApi['id'], 'STARTER_PROJECTS_API_IDENTITY_CLIENT_SECRET' => $tasksApi['client_secret'] ?? '', 'STARTER_IDENTITY_CONSOLE_CLIENT_ID' => $consoleClientId, 'STARTER_IDENTITY_CONSOLE_CLIENT_SECRET' => $consoleClientSecret]);
$writeEnv($identityConsoleEnv, ['IDENTITY_API_URL' => $identityUrl, 'IDENTITY_PROJECT' => 'identity-console', 'IDENTITY_CLIENT_ID' => $consoleClientId, 'IDENTITY_CLIENT_SECRET' => $consoleClientSecret]);
fwrite(STDOUT, "Zoltasoft Starter local Identity projects initialized.\n");
fwrite(STDOUT, "Configured separate Starter and Tasks projects, API/BFF clients, hosted applications and logos, roles, permissions, and local env files.\n");
