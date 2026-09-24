<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\API\Requests;

use App\Services\TaskManagerService\API\Requests\Concerns\ResolvesAuthenticatedIdentity;
use Zolta\Http\Request\BaseRequest;

final class CreateProjectRequest extends BaseRequest
{
    use ResolvesAuthenticatedIdentity;
    public function authorize(): bool { return $this->hasAuthenticatedIdentity(); }
    public function rules(): array { return ['name' => ['required', 'string', 'max:120'], 'key' => ['required', 'string', 'alpha_dash', 'max:32'], 'description' => ['nullable', 'string', 'max:1000']]; }
    public function trustedData(): array { return ['ownerId' => $this->authenticatedUserId()]; }
}
