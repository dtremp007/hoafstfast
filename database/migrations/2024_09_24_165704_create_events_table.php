<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description')->nullable();
            $table->date('day');
            $table->time('time');
            $table->integer('duration');
            $table->timestamps();
            $table->foreignId('location_id')->constrained();
        });
    }

    public function down()
    {
        Schema::dropIfExists('events');
    }
};
