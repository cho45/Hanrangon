/**
 * このファイルは、バックエンドから自動生成された型定義 (./generated/*) の中から
 * フロントエンドで実際に使用する型だけを抽出し、再エクスポートするための手動管理ファイルです。
 *
 * [ルール]
 * 1. 新しい型が必要な場合は、./generated/ 以下のファイルからインポートしてここに追加してください。
 * 2. このファイル内で型を直接定義（interface/type）しないでください。
 * 3. 不要な型（sqlcの内部型など）を隠蔽し、補完候補をクリーンに保つのが目的です。
 */
import * as Models from './generated/models';
import * as Api from './generated/api';

/**
 * Models from backend/model
 */
export type Entry = Models.Entry;
export type Image = Models.Image;
export type SimilarImage = Models.ListSimilarImagesByImageIDsRow;
export type Job = Models.ListJobsRow;

/**
 * Models from backend/app (API related)
 */
export type InfoData = Api.InfoData;
export type TFIDFStats = Api.TFIDFStats;
export type ImageStats = Api.ImageStats;
export type DebugInfo = Api.DebugInfo;
export type GetTopTermsByDFRow = Models.GetTopTermsByDFRow;
export type EditRequest = Api.EditRequest;
export type EditResponse = Api.EditResponse;
export type R2UsageStats = Api.R2UsageStats;
export type OperationStat = Api.OperationStat;
