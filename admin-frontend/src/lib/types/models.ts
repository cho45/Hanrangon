/**
 * このファイルは、バックエンドから自動生成された型定義 (./generated/*) の中から
 * フロントエンドで実際に使用する型だけを抽出し、再エクスポートするための手動管理ファイルです。
 *
 * [ルール]
 * 1. 新しい型が必要な場合は、./generated/ 以下のファイルからインポートしてここに追加してください。
 * 2. このファイル内で型を直接定義（interface/type）しないでください。
 * 3. 不要な型（sqlcの内部型など）を隠蔽し、補完候補をクリーンに保つのが目的です。
 */
import * as MainDB from './generated/maindb';
import * as TFIDFDB from './generated/tfidfdb';
import * as WorkerDB from './generated/workerdb';
import * as ImagesDB from './generated/imagesdb';
import * as Api from './generated/api';

/**
 * Models from backend/model
 */
export type EntryStatus = MainDB.EntryStatus;
export const StatusPublic = MainDB.StatusPublic;
export const StatusDraft = MainDB.StatusDraft;
export const StatusScheduled = MainDB.StatusScheduled;
export const StatusReserved = MainDB.StatusReserved;

export type Entry = MainDB.Entry;
export type Image = ImagesDB.Image;
export type SimilarImage = ImagesDB.ListSimilarImagesByImageIDsRow;
export type Job = WorkerDB.ListJobsRow;

/**
 * Models from backend/app (API related)
 */
export type InfoData = Api.InfoData;
export type TFIDFStats = Api.TFIDFStats;
export type ImageStats = Api.ImageStats;
export type DebugInfo = Api.DebugInfo;
export type GetTopTermsByDFRow = TFIDFDB.GetTopTermsByDFRow;
export type EditRequest = Api.EditRequest;
export type EditResponse = Api.EditResponse;
export type R2UsageStats = Api.R2UsageStats;
export type OperationStat = Api.OperationStat;
