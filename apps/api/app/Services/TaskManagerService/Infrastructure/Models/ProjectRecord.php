<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Infrastructure\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class ProjectRecord extends Model
{
    use HasUuids;
    protected $table = 'projects';
    protected $fillable = ['id', 'owner_id', 'name', 'key', 'description', 'status'];
    public function tasks(): HasMany { return $this->hasMany(TaskRecord::class, 'project_id'); }
}
