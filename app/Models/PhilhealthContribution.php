<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Haruncpi\LaravelUserActivity\Traits\Loggable;

class PhilhealthContribution extends Model
{
    use HasFactory, Loggable;

    protected $fillable = [
        'employee_id',
        'date',
        'philhealth_contribution',
    ];

    protected $casts = [
        'philhealth_contribution' => 'float',
    ];


    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    // Date mutator
    public function getDateAttribute($value)
    {
        return Carbon::parse($value)->format('F d, Y');
    }
}
