<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tutorials', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('category');
            $table->string('level');
            $table->string('duration')->default('10 min');
            $table->string('views')->default('0 views');
            $table->text('description');
            $table->string('image_url', 1000);
            $table->text('intro');
            $table->json('materials');
            $table->json('steps');
            $table->json('tips');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tutorials');
    }
};
