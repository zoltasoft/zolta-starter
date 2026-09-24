<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\API\Requests;

use App\Services\TaskManagerService\API\Requests\Concerns\ResolvesAuthenticatedIdentity;
use Zolta\Http\Request\BaseRequest;

final class UpdateTaskRequest extends BaseRequest
{
    use ResolvesAuthenticatedIdentity;
    public function authorize(): bool { return $this->hasAuthenticatedIdentity(); }
    public function routeParams(): array { return ['taskId' => ['type' => 'string']]; }
    public function rules(): array { return ['taskId' => ['required', 'uuid'], 'title' => ['sometimes', 'string', 'max:160'], 'description' => ['sometimes', 'nullable', 'string', 'max:2000'], 'status' => ['sometimes', 'in:todo,in_progress,done'], 'priority' => ['sometimes', 'in:low,medium,high']]; }
    public function trustedData(): array { return ['ownerId' => $this->authenticatedUserId()]; }
}
