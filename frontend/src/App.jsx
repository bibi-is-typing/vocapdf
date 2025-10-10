import { useRef, useState } from 'react';
import { lookupWords, uploadFile } from './services/dictionaryApi';
import { generatePDF } from './utils/pdfGenerator';
import PDFPreview from './components/PDFPreview';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select } from './components/ui/select';
import { Textarea } from './components/ui/textarea';
import { Alert, AlertDescription } from './components/ui/alert';
import { Loader2 } from 'lucide-react';

function App() {
  const [words, setWords] = useState('');
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');
  const [appliedCefrLevel, setAppliedCefrLevel] = useState('A2');
  const wordInputRef = useRef(null);

  const [options, setOptions] = useState({
    meanings: 1,
    definitions: 1,
    synonyms: 0,
    antonyms: 0,
    related: 0,
    meaningDisplay: 'english',
    cefrLevel: 'A2',
    outputFormat: 'input-order',
    layoutType: 'study',
    includeCheckbox: false,
    includeNumbering: true,
    customDate: new Date().toISOString().split('T')[0]
  });

  const parseWords = (text) => {
    return text
      .split(/[\n,;]+/)
      .map(word => word.trim())
      .filter(word => word.length > 0);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      setProgress('파일을 불러오는 중이에요');

      const result = await uploadFile(file);
      setWords(result.data.words.join('\n'));
      setProgress('');
    } catch (err) {
      setError(err.response?.data?.error?.message || '파일을 불러오지 못했어요');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async () => {
    const wordList = parseWords(words);

    if (wordList.length === 0) {
      setError('단어를 먼저 입력해요');
      return;
    }

    if (wordList.length > 500) {
      setError('500개까지 입력할 수 있어요');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setProgress(`0/${wordList.length} 찾는 중이에요 (0%)`);

      const result = await lookupWords(wordList, options, (progressData) => {
        setProgress(`${progressData.processed}/${progressData.total} 찾는 중이에요 (${progressData.percentage}%)`);
      });

      setWordData(result.data);
      setAppliedCefrLevel(options.cefrLevel);
      setProgress('');
    } catch (err) {
      setError(err.response?.data?.error?.message || '단어를 찾지 못했어요. 네트워크를 확인하고 다시 시도해요');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = () => {
    if (!wordData || wordData.length === 0) {
      setError('먼저 단어를 찾아요');
      return;
    }

    try {
      setError(null);
      generatePDF(wordData, options);
    } catch (err) {
      setError(`PDF로 저장하지 못했어요 (${err.message})`);
    }
  };

  const totalWords = words.trim() ? parseWords(words).length : 0;
  const canGeneratePdf = !!(wordData && wordData.length > 0);
  const currentYear = new Date().getFullYear();

  return (
    <div className="app-surface flex min-h-screen flex-col bg-gradient-to-b from-background via-secondary/20 to-background text-foreground">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            {progress && <p className="mt-4 text-foreground font-medium">{progress}</p>}
          </div>
        </div>
      )}

      <header className="app-header border-b border-border/60 bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <a href="#overview" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-semibold shadow-md shadow-primary/40">VP</span>
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight md:text-lg">VocaPDF</span>
              <span className="text-xs text-muted-foreground md:text-sm">AI Vocabulary Studio</span>
            </div>
          </a>
          <nav className="flex flex-wrap items-center justify-end gap-3">
            <Button
              size="lg"
              onClick={() => wordInputRef.current?.focus()}
              className="word-entry-cta inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary via-primary/80 to-accent px-6 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition hover:from-primary/90 hover:via-primary hover:to-accent/90"
            >
              <span className="h-2 w-2 rounded-full bg-primary-foreground" />
              <span>단어 입력</span>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section id="overview" className="border-b border-border/60 bg-secondary/30">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center">
            <div className="max-w-2xl space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                CEFR 맞춤 PDF 파이프라인
              </span>
              <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
                나만의 단어장을 초안부터 완성까지 한 번에 만들어보세요.
              </h1>
              <p className="text-lg text-muted-foreground">
                VocaPDF는 입력 단어를 AI 사전으로 분석하고 CEFR 수준에 맞춰 정리합니다. 다양한 레이아웃과 체크리스트 옵션으로 학습과 암기를 모두 지원해요.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => wordInputRef.current?.focus()}>
                  단어 입력으로 이동
                </Button>
                <Button size="lg" variant="outline" onClick={handleGeneratePDF} disabled={!canGeneratePdf}>
                  PDF 바로 저장
                </Button>
              </div>
              <dl className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border/60 bg-card/80 p-4 shadow-sm">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">현재 입력</dt>
                  <dd className="mt-2 text-2xl font-semibold text-foreground">{totalWords}</dd>
                  <dd className="text-xs text-muted-foreground">단어 / 최대 500개</dd>
                </div>
                <div className="rounded-lg border border-border/60 bg-card/80 p-4 shadow-sm">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">선택된 레벨</dt>
                  <dd className="mt-2 text-2xl font-semibold text-foreground">{options.cefrLevel}</dd>
                  <dd className="text-xs text-muted-foreground">학습 난이도</dd>
                </div>
                <div className="rounded-lg border border-border/60 bg-card/80 p-4 shadow-sm">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">미리보기 상태</dt>
                  <dd className="mt-2 text-2xl font-semibold text-foreground">{canGeneratePdf ? '준비 완료' : '대기 중'}</dd>
                  <dd className="text-xs text-muted-foreground">{canGeneratePdf ? 'PDF로 내보내세요' : '단어를 찾으면 생성돼요'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section id="workflow" className="mx-auto w-full max-w-6xl px-6 py-12">
          <div className="grid gap-8 lg:grid-cols-[420px,1fr]">
            <Card className="border border-border/70 shadow-lg shadow-primary/5">
              <CardHeader className="space-y-3">
                <CardTitle className="text-2xl font-semibold text-foreground">단어 입력</CardTitle>
                <CardDescription>
                  단어, 숙어, 문장을 한 줄에 하나씩 입력하거나 파일로 업로드하면 자동으로 정리돼요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <Textarea
                  ref={wordInputRef}
                  value={words}
                  onChange={(e) => setWords(e.target.value)}
                  placeholder={`예: sustainable\nmake up for\nI brushed up on important idioms.`}
                  rows={12}
                  className="font-mono text-sm"
                />

                <div className="rounded-xl border border-border/70 bg-secondary/40 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <Label htmlFor="cefrLevel" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        CEFR 레벨
                      </Label>
                      <p className="mt-1 text-lg font-semibold text-foreground">{options.cefrLevel} 학습 코스</p>
                    </div>
                    <Select
                      id="cefrLevel"
                      value={options.cefrLevel}
                      onChange={(e) => setOptions({ ...options, cefrLevel: e.target.value })}
                      className="sm:max-w-[160px]"
                    >
                      <option value="A2">A2 (초급)</option>
                      <option value="B1">B1 (중급)</option>
                      <option value="B2">B2 (중상급)</option>
                      <option value="C1">C1 (고급)</option>
                    </Select>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    선택한 수준은 검색 결과와 PDF 레이아웃에 반영돼요. 필요하면 언제든 다시 변경할 수 있어요.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={handleLookup}
                    disabled={loading || !words.trim()}
                    className="flex-1"
                    size="lg"
                  >
                    {loading ? '찾는 중이에요.' : '단어 찾기'}
                  </Button>

                  <label htmlFor="file-upload" className="flex flex-1">
                    <span className="upload-trigger inline-flex w-full items-center justify-center rounded-md border border-dashed border-primary/40 bg-secondary/50 px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-secondary/70 hover:text-primary-foreground hover:shadow-lg">
                      📁 txt · csv · md 업로드
                    </span>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".txt,.csv,.md"
                      onChange={handleFileUpload}
                      className="sr-only absolute -z-10 h-0 w-0 opacity-0"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6" id="features">
              {error && (
                <Alert variant="destructive" className="border border-destructive/40 bg-destructive/10">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!canGeneratePdf && !error && (
                <Card className="border border-dashed border-border/70 bg-card/70 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-foreground">샘플 워크플로</CardTitle>
                    <CardDescription>
                      단어를 입력하거나 파일을 업로드하면 결과와 PDF 미리보기가 이 영역에 표시돼요.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ol className="list-decimal space-y-3 pl-5 text-sm text-muted-foreground">
                      <li>상단 입력창에 단어를 추가하거나 txt/csv/md 파일을 업로드해요.</li>
                      <li>
                        CEFR 레벨을 선택하고 <span className="font-medium text-foreground">단어 찾기</span> 버튼을 눌러요.
                      </li>
                      <li>결과가 준비되면 레이아웃을 조절하고 PDF를 내려받아요.</li>
                    </ol>
                  </CardContent>
                </Card>
              )}

              {canGeneratePdf && (
                <>
                  {options.cefrLevel !== appliedCefrLevel && (
                    <Alert variant="warning" className="border border-accent/40 bg-accent/10">
                      <AlertDescription className="text-sm text-foreground">
                        <p className="font-medium">선택한 수준이 바뀌었어요. 새 레벨로 다시 조회해 주세요.</p>
                        <Button
                          onClick={handleLookup}
                          disabled={loading}
                          variant="default"
                          size="sm"
                          className="mt-3"
                        >
                          {options.cefrLevel} 수준으로 다시 찾기
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Card className="border border-border/70 bg-card/80 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-foreground">보기 방식</CardTitle>
                      <CardDescription>학습 목적에 맞게 레이아웃과 옵션을 조정하세요.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="layoutType" className="text-sm font-semibold text-muted-foreground">
                          보기 유형
                        </Label>
                        <Select
                          id="layoutType"
                          value={options.layoutType}
                          onChange={(e) => setOptions({ ...options, layoutType: e.target.value })}
                        >
                          <option value="study">학습용 (원문 + 예문/번역)</option>
                          <option value="memorization">암기용 (원문 + 빈칸)</option>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customDate" className="text-sm font-semibold text-muted-foreground">
                          학습 날짜
                        </Label>
                        <Input
                          id="customDate"
                          type="date"
                          value={options.customDate}
                          onChange={(e) => setOptions({ ...options, customDate: e.target.value })}
                          className="max-w-xs"
                        />
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <input
                            type="checkbox"
                            checked={options.includeCheckbox}
                            onChange={(e) => setOptions({ ...options, includeCheckbox: e.target.checked })}
                            className="h-4 w-4 accent-primary"
                          />
                          체크박스 표시
                        </label>

                        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <input
                            type="checkbox"
                            checked={options.includeNumbering}
                            onChange={(e) => setOptions({ ...options, includeNumbering: e.target.checked })}
                            className="h-4 w-4 accent-primary"
                          />
                          번호 표시
                        </label>
                      </div>
                    </CardContent>
                  </Card>

                  <Card id="preview" className="border border-border/70 bg-card/90 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-foreground">미리 보기</CardTitle>
                      <CardDescription>PDF로 내��내기 전에 레이아웃을 확인하세요.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <PDFPreview
                        wordData={wordData}
                        options={options}
                        onGeneratePDF={handleGeneratePDF}
                      />
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-card/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-md">VP</span>
            <span>© {currentYear} VocaPDF</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border/80 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-border hover:bg-secondary/60 hover:text-primary"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
