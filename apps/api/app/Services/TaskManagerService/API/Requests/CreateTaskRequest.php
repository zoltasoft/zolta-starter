<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\API\Requests;

use App\Services\TaskManagerService\API\Requests\Concerns\ResolvesAuthenticatedIdentity;
use Zolta\Http\Request\BaseRequest;

final class CreateTaskRequest extends BaseRequest
{
    use ResolvesAuthenticatedIdentity;
    public function authorize(): bool { return $this->hasAuthenticatedIdentity(); }
    public function routeParams(): array { return ['projectId' => ['type' => 'string']]; }
    public function rules(): array { return ['projectId' => ['required', 'uuid'], 'title' => ['required', 'string', 'max:160'], 'description' => ['nullable', 'string', 'max:2000'], 'priority' => ['sometimes', 'in:low,medium,high']]; }
    public function trustedData(): array { return ['ownerId' => $this->authenticatedUserId()]; }
}
