<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\API\Requests;

use App\Services\TaskManagerService\API\Requests\Concerns\ResolvesAuthenticatedIdentity;
use Zolta\Http\Request\BaseRequest;

final class ListProjectsRequest extends BaseRequest
{
    use ResolvesAuthenticatedIdentity;
    public function authorize(): bool { return $this->hasAuthenticatedIdentity(); }
    public function rules(): array { return []; }
    public function trustedData(): array { return ['ownerId' => $this->authenticatedUserId()]; }
}
