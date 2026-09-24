<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\API\Requests;

use App\Services\TaskManagerService\API\Requests\Concerns\ResolvesAuthenticatedIdentity;
use Zolta\Http\Request\BaseRequest;

final class ListProjectTasksRequest extends BaseRequest
{
    use ResolvesAuthenticatedIdentity;
    public function authorize(): bool { return $this->hasAuthenticatedIdentity(); }
    public function routeParams(): array { return ['projectId' => ['type' => 'string']]; }
    public function rules(): array
    {
        return [
            'projectId' => ['required', 'uuid'],
            'status' => ['sometimes', 'in:todo,in_progress,done'],
            'priority' => ['sometimes', 'in:low,medium,high'],
            'search' => ['sometimes', 'string', 'max:120'],
        ];
    }
    public function trustedData(): array { return ['ownerId' => $this->authenticatedUserId()]; }
}
