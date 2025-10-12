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
  const [progressPercent, setProgressPercent] = useState(0);
  const [appliedCefrLevel, setAppliedCefrLevel] = useState('A2');
  const [excludedCount, setExcludedCount] = useState(0);
  const [excludedDetails, setExcludedDetails] = useState({ korean: 0, duplicate: 0, failed: 0 });
  const [searchedCount, setSearchedCount] = useState(0);
  const wordInputRef = useRef(null);
  const fileInputRef = useRef(null);

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
      .split(/\n+/)
      .map(word => word.trim())
      .filter(word => word.length > 0);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      setProgress('파일을 읽고 있어요');

      const result = await uploadFile(file);
      const uploadedWords = result.data.words;

      // 모든 단어 입력 (한글 포함)
      setWords(uploadedWords.join('\n'));
      setProgress('');
    } catch (err) {
      setError(err.response?.data?.error?.message || '파일을 읽을 수 없어요');
      setProgress('');
    } finally {
      setLoading(false);
      // 파일 input 초기화 (같은 파일 재업로드 가능하도록)
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLookup = async () => {
    const wordList = parseWords(words);

    if (wordList.length === 0) {
      setError('단어를 입력해주세요');
      return;
    }

    if (wordList.length > 500) {
      setError('최대 500개까지만 입력할 수 있어요');
      return;
    }

    // 한글 자동 필터링
    const koreanRegex = /[\uAC00-\uD7AF]/;
    const nonKoreanList = wordList.filter(word => !koreanRegex.test(word));
    const koreanCount = wordList.length - nonKoreanList.length;

    // 중복 제거
    const uniqueList = [...new Set(nonKoreanList)];
    const duplicateCount = nonKoreanList.length - uniqueList.length;

    if (uniqueList.length === 0) {
      setError('영어 단어를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 예상 소요 시간 계산 (배치 처리로 항목당 약 0.25초)
      const estimatedSeconds = Math.ceil(uniqueList.length * 0.25);
      const estimatedTime = estimatedSeconds < 60
        ? `약 ${estimatedSeconds}초`
        : `약 ${Math.ceil(estimatedSeconds / 60)}분`;

      setProgress(`0/${wordList.length} 단어를 찾고 있어요 · ${estimatedTime} 소요 예상`);
      setProgressPercent(0);

      // 진행률 시뮬레이션 (0% -> 90%까지 점진적 증가)
      const totalDuration = estimatedSeconds * 1000; // ms
      const updateInterval = 100; // 100ms마다 업데이트
      const steps = totalDuration / updateInterval;
      const percentPerStep = 90 / steps; // 90%까지만 시뮬레이션

      let currentPercent = 0;
      const progressTimer = setInterval(() => {
        currentPercent = Math.min(90, currentPercent + percentPerStep);
        const estimatedProcessed = Math.floor((currentPercent / 100) * wordList.length);
        setProgressPercent(Math.floor(currentPercent));
        setProgress(`${estimatedProcessed}/${wordList.length} 단어를 찾고 있어요 · ${estimatedTime} 소요 예상`);
      }, updateInterval);

      try {
        const result = await lookupWords(uniqueList, options);
        clearInterval(progressTimer);

        // 완료 시 100%로 설정
        setProgressPercent(100);
        setProgress(`${wordList.length}/${wordList.length} 단어를 찾았어요!`);

        // 검색 성공/실패 개수 계산
        const successData = result.data.filter(item => !item.error);
        const failedCount = uniqueList.length - successData.length;

        // 잠시 후 결과 표시
        setTimeout(() => {
          setWordData(result.data);
          setSearchedCount(successData.length); // 검색 성공한 단어 수
          setExcludedCount(koreanCount + duplicateCount + failedCount);
          setExcludedDetails({ korean: koreanCount, duplicate: duplicateCount, failed: failedCount });
          setAppliedCefrLevel(options.cefrLevel);
          setProgress('');
          setProgressPercent(0);
          setLoading(false);
        }, 500);
      } catch (err) {
        clearInterval(progressTimer);
        throw err;
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || '단어를 찾을 수 없어요. 네트워크를 확인해주세요');
      setProgress('');
      setProgressPercent(0);
      setLoading(false);
    }
  };

  const handleGeneratePDF = () => {
    if (!wordData || wordData.length === 0) {
      setError('단어를 먼저 검색해주세요');
      return;
    }

    try {
      setError(null);
      generatePDF(wordData, options);
    } catch (err) {
      setError(`PDF를 저장할 수 없어요 (${err.message})`);
    }
  };

  const scrollToInput = () => {
    wordInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => wordInputRef.current?.focus(), 500);
  };

  const handleReset = () => {
    setWords('');
    setWordData(null);
    setError(null);
    setProgress('');
    setProgressPercent(0);
    setExcludedCount(0);
    setExcludedDetails({ korean: 0, duplicate: 0, failed: 0 });
    setSearchedCount(0);
    setOptions({
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
    setAppliedCefrLevel('A2');
    // 파일 input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    wordInputRef.current?.focus();
  };

  const totalWords = words.trim() ? parseWords(words).length : 0;
  const canGeneratePdf = !!(wordData && wordData.length > 0);
  const isLevelChanged = canGeneratePdf && options.cefrLevel !== appliedCefrLevel;
  const currentYear = new Date().getFullYear();

  return (
    <div className="app-surface flex min-h-screen flex-col bg-gradient-to-b from-background via-secondary/20 to-background text-foreground">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md px-4">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-border/50 bg-card/90 p-6 shadow-2xl sm:space-y-6 sm:p-8">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 sm:mb-4 sm:h-16 sm:w-16">
                <Loader2 className="h-7 w-7 animate-spin text-primary sm:h-8 sm:w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground sm:text-xl">단어를 찾고 있어요</h3>
              {progress && (
                <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{progress}</p>
              )}
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-foreground">{progressPercent}%</span>
                <span className="text-muted-foreground">완료</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg bg-primary/5 p-3 text-center sm:p-4">
              <p className="text-xs text-muted-foreground">
                잠시만 기다려주세요<br/>
                AI가 단어 뜻을 찾고 있어요
              </p>
            </div>
          </div>
        </div>
      )}

      <header className="app-header border-b border-border/60 bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <a href="/" className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center">
                <img 
                src="/vocapdf_logo.png" 
                alt="VocaPDF" 
                className="h-10 w-auto sm:h-16 md:h-20"
                />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl md:text-3xl text-muted-foreground">AI 단어장 메이커</span>
            </div>
          </a>
          <nav className="flex flex-wrap items-center justify-end gap-3">
            <Button
              size="lg"
              onClick={scrollToInput}
              className="word-entry-cta inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary via-primary/80 to-accent px-6 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition-all hover:from-primary/90 hover:via-primary hover:to-accent/90 hover:shadow-xl active:scale-95 active:brightness-90"
            >
              <span className="h-2 w-2 rounded-full bg-primary-foreground" />
              <span>단어 입력</span>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section id="overview" className="border-b border-border/60 bg-secondary/30">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12 md:py-16 lg:flex-row lg:items-center lg:gap-10">
            <div className="w-full space-y-4 sm:space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-4 sm:py-2 sm:text-xs">
                CEFR 레벨별 맞춤 제작
              </span>
              <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
                단어만 입력하면, PDF 단어장이 완성돼요.
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg">
                AI가 단어 뜻을 찾아주고, CEFR 레벨에 맞춰 정리해요. 학습용·암기용 레이아웃을 선택해서 나만의 단어장을 만들 수 있어요.
              </p>
              <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
                <Button
                  size="default"
                  onClick={scrollToInput}
                  className="h-12 text-sm transition-all active:scale-95 active:brightness-90 sm:text-base hover:shadow-lg"
                >
                  바로 시작하기
                </Button>
                <button
                  onClick={handleGeneratePDF}
                  disabled={!canGeneratePdf}
                  className="inline-flex h-12 items-center gap-2 rounded-md border border-accent bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:bg-accent/90 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 sm:px-4 sm:py-2 sm:text-sm"
                >
                  PDF 다운로드
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 md:py-12">
          {/* 모바일/태블릿: 사용법 먼저 표시 */}
          {!canGeneratePdf && !error && (
            <Card className="mb-4 border border-border/70 bg-card/80 shadow-md lg:hidden">
              <CardHeader className="space-y-1.5 sm:space-y-2">
                <CardTitle className="text-lg font-semibold text-foreground sm:text-xl">
                  3단계면 끝나요.
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  간단하게 시작해보세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-5">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary sm:h-7 sm:w-7 sm:text-sm">1</div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground sm:text-sm">단어를 입력하거나 파일을 올려요.</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">단어, 숙어, 문장 모두 가능해요.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary sm:h-7 sm:w-7 sm:text-sm">2</div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground sm:text-sm">CEFR 레벨을 선택하고 검색해요.</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">A2~C1 레벨에 맞춰 뜻을 찾아줘요.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary sm:h-7 sm:w-7 sm:text-sm">3</div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground sm:text-sm">레이아웃을 골라 PDF를 받아요.</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">학습용과 암기용 중 선택할 수 있어요.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 sm:p-4">
                  <p className="text-xs font-semibold text-foreground sm:text-sm">이건 안 돼요.</p>
                  <ul className="space-y-1 text-[10px] text-muted-foreground sm:text-xs">
                    <li>• 한글 단어는 지원하지 않아요.</li>
                    <li>• 500개 이상은 한 번에 검색할 수 없어요.</li>
                    <li>• 5MB보다 큰 파일은 업로드할 수 없어요.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-4 sm:gap-6 lg:grid lg:grid-cols-[420px,minmax(0,1fr)]">
            <div className="space-y-4 sm:space-y-6">
              <Card className="h-fit border border-border/70 shadow-lg shadow-primary/5">
                <CardHeader className="space-y-2 sm:space-y-3">
                  <CardTitle className="text-xl font-semibold text-foreground sm:text-2xl">단어 입력</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    단어, 숙어, 문장을 한 줄에 하나씩 적거나 파일로 올려주세요.
                  </CardDescription>
                </CardHeader>
              <CardContent className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <Textarea
                    ref={wordInputRef}
                    value={words}
                    onChange={(e) => setWords(e.target.value)}
                    placeholder={`한 줄에 하나씩 입력해주세요.\n\napple\nsustainable development\nmake up for\nI grew up in London.`}
                    rows={12}
                    className="font-mono text-xs sm:text-sm"
                    disabled={canGeneratePdf}
                  />
                  <div className="flex items-center justify-between px-1">
                    <span className={`text-xs font-medium ${totalWords > 500 ? 'text-destructive' : 'text-muted-foreground'} sm:text-sm`}>
                      {totalWords > 0 ? `${totalWords}개 입력됨` : '단어를 입력해주세요'}
                    </span>
                    {totalWords > 0 && (
                      <span className={`text-xs font-semibold ${totalWords > 500 ? 'text-destructive' : 'text-primary'} sm:text-sm`}>
                        {totalWords}/500
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <Label htmlFor="cefrLevel" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                        CEFR 레벨
                      </Label>
                      <p className="mt-1.5 text-base font-semibold text-primary sm:mt-2 sm:text-lg">{options.cefrLevel} 레벨</p>
                    </div>
                    <Select
                      id="cefrLevel"
                      value={options.cefrLevel}
                      onChange={(e) => setOptions({ ...options, cefrLevel: e.target.value })}
                      className="w-full text-sm sm:w-[160px] sm:text-base"
                    >
                      <option value="A2">A2 (초급)</option>
                      <option value="B1">B1 (중급)</option>
                      <option value="B2">B2 (중상급)</option>
                      <option value="C1">C1 (고급)</option>
                    </Select>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground sm:mt-4 sm:text-sm">
                    레벨에 맞는 뜻을 찾아드려요. 언제든 바꿀 수 있어요.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="flex gap-2.5 sm:gap-3">
                    <div className="flex flex-1">
                      <span
                        onClick={!loading && words.trim() && (!canGeneratePdf || isLevelChanged) ? handleLookup : undefined}
                        className={`inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow transition-all hover:brightness-95 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 active:brightness-90 sm:gap-2 sm:px-4 sm:text-sm ${
                          loading || !words.trim() || (canGeneratePdf && !isLevelChanged) ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                        }`}
                      >
                        {loading ? '찾고 있어요' : isLevelChanged ? '다시 검색' : '검색'}
                      </span>
                    </div>

                    <div className="flex flex-1">
                      <label htmlFor="file-upload" className={`group relative flex flex-1 ${canGeneratePdf ? 'pointer-events-none opacity-50' : ''}`}>
                        <span className="upload-trigger inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-primary/40 bg-secondary/50 px-3 text-xs font-semibold text-primary transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:-translate-y-0.5 active:scale-95 active:bg-primary active:text-primary-foreground focus-visible:border-primary focus-visible:bg-primary focus-visible:text-primary-foreground cursor-pointer sm:gap-2 sm:px-4 sm:text-sm">
                          파일 업로드
                        </span>
                        <span className="pointer-events-none absolute -bottom-8 left-1/2 z-10 hidden w-max -translate-x-1/2 rounded-md border border-border bg-card px-2.5 py-1.5 text-[10px] text-foreground shadow-lg group-hover:block sm:text-xs">
                          txt, csv, md 파일 지원
                        </span>
                        <Input
                          ref={fileInputRef}
                          id="file-upload"
                          type="file"
                          accept=".txt,.csv,.md"
                          onChange={handleFileUpload}
                          disabled={canGeneratePdf}
                          className="sr-only absolute -z-10 h-0 w-0 opacity-0"
                        />
                      </label>
                    </div>
                  </div>

                  {(words.trim() || wordData) && (
                    <button
                      onClick={handleReset}
                      disabled={loading}
                      className={`inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-md border border-destructive/30 bg-secondary/50 px-3 text-xs font-semibold text-destructive shadow-sm transition-all hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive hover:shadow-md hover:-translate-y-0.5 active:scale-95 active:bg-destructive/10 sm:gap-2 sm:px-4 sm:text-sm ${
                        loading ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                      }`}
                      aria-label="입력 초기화"
                    >
                      다시 입력
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>

            {isLevelChanged && (
              <Alert variant="warning" className="border border-accent/40 bg-accent/10">
                <AlertDescription className="text-xs sm:text-sm">
                  <p className="font-medium text-primary">레벨이 바뀌었어요. 다시 검색해주세요.</p>
                </AlertDescription>
              </Alert>
            )}
            </div>

            <div className="space-y-4 sm:space-y-6" id="features">
              {error && (
                <Alert variant="destructive" className="border border-destructive/40 bg-destructive/10 shadow-sm">
                  <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {!canGeneratePdf && !error && (
                <Card className="hidden border border-border/70 bg-card/80 shadow-md lg:block">
                  <CardHeader className="space-y-1.5 sm:space-y-2">
                    <CardTitle className="text-lg font-semibold text-foreground sm:text-xl">
                      3단계면 끝나요.
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      간단하게 시작해보세요.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-5">
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary sm:h-7 sm:w-7 sm:text-sm">1</div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-foreground sm:text-sm">단어를 입력하거나 파일을 올려요.</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">단어, 숙어, 문장 모두 가능해요.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary sm:h-7 sm:w-7 sm:text-sm">2</div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-foreground sm:text-sm">CEFR 레벨을 선택하고 검색해요.</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">A2~C1 레벨에 맞춰 뜻을 찾아줘요.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary sm:h-7 sm:w-7 sm:text-sm">3</div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-foreground sm:text-sm">레이아웃을 골라 PDF를 받아요.</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">학습용과 암기용 중 선택할 수 있어요.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 sm:p-4">
                      <p className="text-xs font-semibold text-foreground sm:text-sm">이건 안 돼요.</p>
                      <ul className="space-y-1 text-[10px] text-muted-foreground sm:text-xs">
                        <li>• 한글 단어는 지원하지 않아요.</li>
                        <li>• 500개 이상은 한 번에 검색할 수 없어요.</li>
                        <li>• 5MB보다 큰 파일은 업로드할 수 없어요.</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              {canGeneratePdf && (
                <>
                  <dl className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                    <div className="flex flex-col gap-1 rounded-lg border border-border/70 bg-card/90 p-2 shadow-md sm:gap-1.5 sm:p-4 lg:gap-2 lg:p-5">
                      <dt className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[10px] lg:text-xs">입력</dt>
                      <dd className="text-lg font-bold text-foreground sm:text-2xl lg:text-3xl">{totalWords}개</dd>
                      <dd className="text-[8px] text-muted-foreground sm:text-[10px] lg:text-xs">최대 500개</dd>
                    </div>
                    <div className="flex flex-col gap-1 rounded-lg border border-border/70 bg-card/90 p-2 shadow-md sm:gap-1.5 sm:p-4 lg:gap-2 lg:p-5">
                      <dt className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[10px] lg:text-xs">검색 완료</dt>
                      <dd className="text-lg font-bold text-foreground sm:text-2xl lg:text-3xl">{searchedCount}개</dd>
                      <dd className="text-[8px] text-muted-foreground sm:text-[10px] lg:text-xs">뜻을 찾았어요</dd>
                    </div>
                    <div className="group relative flex flex-col gap-1 rounded-lg border border-border/70 bg-card/90 p-2 shadow-md sm:gap-1.5 sm:p-4 lg:gap-2 lg:p-5">
                      <dt className="flex items-center gap-1 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[10px] lg:text-xs">
                        제외
                        <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </dt>
                      <dd className="text-lg font-bold text-foreground sm:text-2xl lg:text-3xl">{excludedCount}개</dd>
                      <dd className="text-[8px] text-muted-foreground sm:text-[10px] lg:text-xs">한글·중복·오타</dd>

                      {/* 툴팁 */}
                      <div className="pointer-events-none absolute -top-2 left-1/2 z-10 hidden w-max -translate-x-1/2 -translate-y-full rounded-md border border-border bg-card px-3 py-2 text-[10px] shadow-lg group-hover:block sm:text-xs">
                        <div className="space-y-1">
                          {excludedDetails.korean > 0 && (
                            <p className="text-foreground">• 한글: {excludedDetails.korean}개</p>
                          )}
                          {excludedDetails.duplicate > 0 && (
                            <p className="text-foreground">• 중복: {excludedDetails.duplicate}개</p>
                          )}
                          {excludedDetails.failed > 0 && (
                            <p className="text-foreground">• 오타: {excludedDetails.failed}개</p>
                          )}
                          {excludedCount === 0 && (
                            <p className="text-muted-foreground">제외된 항목이 없어요</p>
                          )}
                        </div>
                        {/* 화살표 */}
                        <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-4 border-transparent border-t-border"></div>
                        <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 -translate-y-px border-4 border-transparent border-t-card"></div>
                      </div>
                    </div>
                  </dl>

                  <Card className="border border-border/70 bg-card/80 shadow-md">
                    <CardHeader className="space-y-1.5 sm:space-y-2">
                      <CardTitle className="text-lg font-semibold text-foreground sm:text-xl">보기 방식</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">원하는 레이아웃을 골라보세요.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-5">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="layoutType" className="text-xs font-semibold text-muted-foreground sm:text-sm">
                          보기 유형
                        </Label>
                        <Select
                          id="layoutType"
                          value={options.layoutType}
                          onChange={(e) => setOptions({ ...options, layoutType: e.target.value })}
                          className="text-xs sm:text-sm"
                        >
                          <option value="study">학습용 (원문 + 뜻/유사표현)</option>
                          <option value="memorization">암기용 (원문 + 빈칸)</option>
                        </Select>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="customDate" className="text-xs font-semibold text-muted-foreground sm:text-sm">
                          학습 날짜
                        </Label>
                        <Input
                          id="customDate"
                          type="date"
                          value={options.customDate}
                          onChange={(e) => setOptions({ ...options, customDate: e.target.value })}
                          className="max-w-xs text-xs sm:text-sm"
                        />
                      </div>

                      <div className="flex flex-wrap gap-3 sm:gap-4">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-foreground sm:gap-2 sm:text-sm">
                          <input
                            type="checkbox"
                            checked={options.includeCheckbox}
                            onChange={(e) => setOptions({ ...options, includeCheckbox: e.target.checked })}
                            className="h-3.5 w-3.5 accent-primary sm:h-4 sm:w-4"
                          />
                          체크박스 표시
                        </label>

                        <label className="flex items-center gap-1.5 text-xs font-medium text-foreground sm:gap-2 sm:text-sm">
                          <input
                            type="checkbox"
                            checked={options.includeNumbering}
                            onChange={(e) => setOptions({ ...options, includeNumbering: e.target.checked })}
                            className="h-3.5 w-3.5 accent-primary sm:h-4 sm:w-4"
                          />
                          번호 표시
                        </label>
                      </div>
                    </CardContent>
                  </Card>

                  <Card id="preview" className="border border-border/70 bg-card/90 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-foreground sm:text-xl">미리보기</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      {/* 미리보기 안내 문구 */}
                      <div className="flex items-center justify-center rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5 text-xs sm:text-sm">
                        <p className="font-medium text-primary">
                          미리보기는 대략적인 모습이에요. 실제 PDF는 내용 길이에 따라 페이지당 단어 개수가 조금 다를 수 있어요.
                        </p>
                      </div>
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
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* 상단: 로고와 GitHub 링크들 */}
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                <div className="inline-flex items-center justify-center">
                  <img
                  src="/vocapdf_logo.png"
                  alt="VocaPDF"
                  className="h-10 w-auto"
                  />
                </div>

                {/* <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-md sm:h-9 sm:w-9 sm:text-sm">VP</span> */}
                <span>© {currentYear} VocaPDF</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <a
                  href="https://github.com/bibi-is-typing/vocapdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-border/80 bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-border hover:bg-secondary/60 hover:text-primary sm:px-4 sm:py-2 sm:text-sm"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </a>
                <a
                  href="https://github.com/bibi-is-typing/vocapdf/issues"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-border/80 bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-border hover:bg-secondary/60 hover:text-primary sm:px-4 sm:py-2 sm:text-sm"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  제안하기
                </a>
                <a
                  href="https://github.com/sponsors/bibi-is-typing"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-accent bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:bg-accent/90 hover:shadow-lg sm:px-4 sm:py-2 sm:text-sm"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  후원하기
                </a>
              </div>
            </div>

            {/* 하단: 사전 출처 */}
            <div className="border-t border-border/40 pt-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold text-muted-foreground sm:text-sm">
                  이런 사전을 쓰고 있어요
                </h3>
                <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground sm:gap-4 sm:text-xs">
                  <a
                    href="https://dictionaryapi.dev"
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-foreground hover:underline"
                  >
                    Free Dictionary
                  </a>
                  <span className="text-border">•</span>
                  <a
                    href="https://developer.oxforddictionaries.com"
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-foreground hover:underline"
                  >
                    Oxford Dictionaries
                  </a>
                  <span className="text-border">•</span>
                  <a
                    href="https://ai.google.dev/gemini-api"
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-foreground hover:underline"
                  >
                    Google Gemini
                  </a>
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground/70 sm:text-xs">
                  영어 단어 뜻은 Free Dictionary와 Oxford에서, AI 번역과 CEFR 레벨별 정의는 Google Gemini가 도와줘요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
