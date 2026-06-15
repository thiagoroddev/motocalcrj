// Helpers de I/O de arquivo no browser (TASK-RF-7.2). Isolam o acesso ao DOM
// (Blob, <a download>, FileReader) para que componentes não toquem nessas APIs
// diretamente.

export function baixarTexto(nome: string, conteudo: string, tipoMime = 'application/json'): void {
  const blob = new Blob([conteudo], { type: tipoMime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function lerArquivoTexto(arquivo: File): Promise<string> {
  return new Promise((resolver, rejeitar) => {
    const leitor = new FileReader();
    leitor.onload = () => resolver(String(leitor.result ?? ''));
    leitor.onerror = () => rejeitar(leitor.error ?? new Error('Falha ao ler o arquivo'));
    leitor.readAsText(arquivo);
  });
}
