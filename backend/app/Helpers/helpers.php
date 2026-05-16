<?php

function cosineSimilarity($a, $b)
{
    $dotProduct = 0.0;
    $normA = 0.0;
    $normB = 0.0;

    $length = min(count($a), count($b));

    for ($i = 0; $i < $length; $i++) {
        $dotProduct += $a[$i] * $b[$i];
        $normA += pow($a[$i], 2);
        $normB += pow($b[$i], 2);
    }

    if ($normA == 0 || $normB == 0) {
        return 0;
    }

    return $dotProduct / (sqrt($normA) * sqrt($normB));
}