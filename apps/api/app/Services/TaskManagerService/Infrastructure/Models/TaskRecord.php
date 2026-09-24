<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Infrastructure\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class TaskRecord extends Model
{
    use HasUuids;
    protected $table = 'project_tasks';
    protected $fillable = ['id', 'project_id', 'owner_id', 'title', 'description', 'status', 'priority'];
    public function project(): BelongsTo { return $this->belongsTo(ProjectRecord::class, 'project_id'); }
}
