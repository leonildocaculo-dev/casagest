<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AutentiqueService
{
    protected string $token;
    protected string $apiUrl = 'https://api.autentique.com.br/v2/graphql';

    public function __construct()
    {
        $this->token = env('AUTENTIQUE_TOKEN', '');
    }

    /**
     * Envia um documento para assinatura
     */
    public function createDocument(string $fileName, string $fileContentBase64, array $signers)
    {
        $query = 'mutation CreateDocumentMutation(
            $document: DocumentInput!,
            $signers: [SignerInput!]!,
            $file: String!
        ) {
            createDocument(
                document: $document,
                signers: $signers,
                file: $file
            ) {
                id
                name
                signatures {
                    public_id
                    name
                    email
                    action { name }
                    link { short_link }
                }
            }
        }';

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Content-Type'  => 'application/json'
        ])->post($this->apiUrl, [
            'query' => $query,
            'variables' => [
                'document' => [
                    'name' => $fileName,
                ],
                'signers' => $signers,
                'file' => $fileContentBase64
            ],
        ]);

        return $response->json();
    }
}
